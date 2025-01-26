import geocoder
import json
from django.shortcuts import render
from django.db.models import Q
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action, api_view, permission_classes, authentication_classes
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView, CreateAPIView, UpdateAPIView, DestroyAPIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.hashers import make_password, check_password
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework import status
from .models import *
from .serializers import *
import requests
import os

# API_KEY = os.environ.get('WEATHER_API_KEY')
API_KEY = 'd412a4ce11021c665a3219a3b796b1c2'
# Create your views here.


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        # Check if the serialized data is valid
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Retrieve Token data from the serialized data
        token_data = serializer.validated_data
        response = Response({
            "message": "Login successful",
            "user_id": token_data['user_id'],
            "access": token_data['access'],
            "refresh": token_data['refresh'],
            "first_name": token_data['first_name']
        }, status=status.HTTP_200_OK)
        return response


class Register(APIView):
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data.get('email')
            password = serializer.validated_data.get('password')
            confirm_password = serializer.validated_data.get(
                'confirm_password')
            if password != confirm_password:
                return Response({'message': 'Passwords do not match'}, status=status.HTTP_403_FORBIDDEN)
            user = serializer.save(
                email=email, password=make_password(password))
            user.save()  # save the user object
            data = serializer.data.copy()
            data.update({"message": "Registration Successfull"})
            return Response(data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def request_token(request):
    email = request.data.get('email')
    user = User.objects.filter(email=email).first()
    if user:
        reset_auth = ResetTokenAuthentication()
        # Generate the reset token
        reset_tok = reset_auth.generate_token()
        # Save reset token to the database
        user.reset_token = reset_tok
        user.save()
        # Create the reset link
        # reset_link = request.build_absolute_uri(f'/reset_token/{reset_tok}')
        reset_link = f'http://localhost:5173/reset_token/{reset_tok}'
        # Send the reset link
        reset_auth.send_password_reset_email(user=user, link=reset_link)
        return Response({'message': f'Reset link sent to {user.email}'}, status=status.HTTP_201_CREATED)
    return Response({'message': 'User not found'},  status=status.HTTP_404_NOT_FOUND)


@api_view(['GET', 'POST'])
def reset_token(request, reset_token):
    if request.method == 'POST':
        print(f'Reset Token: {reset_token}')
        user = User.objects.filter(reset_token=reset_token).first()
        if not user:
            return Response({'message': 'Invalid reset token'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = UserPasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            password = serializer.data.get('password')
            confirm_password = serializer.data.get('confirm_password')
            print(f'Password: {password}')
            print(f'Confirm Password: {confirm_password}')
            if password == confirm_password:
                user.password = make_password(password)
                user.reset_token = None
                user.save()
                return Response({'message': 'Password reset successful'}, status=status.HTTP_200_OK)
            return Response({'message': 'Passwords do not match'}, status=status.HTTP_406_NOT_ACCEPTABLE)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response({'Token': f'{reset_token}'}, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        try:
            print(f'Request Data: {request.data}')
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out"}, status=200)
        except TokenError:
            return Response({"error": "Invalid or already blacklisted token"}, status=400)
        except KeyError:
            return Response({"error": "Refresh token is required"}, status=400)
        except Exception as e:
            print(f'Error: {e}')
            return Response({"error": str(e)}, status=500)


@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_current_location(request):
    user = request.user
    # Get the current location using IP address
    g = geocoder.ip('me')
    try:
        if g.ok:
            # Get the latitude and longitude from the current location
            latitude = g.latlng[0]
            longitude = g.latlng[1]
            # Create the URL for the API request
            url = f'http://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={API_KEY}'
            response = requests.get(url)
            # Checks if the response is successful
            if response:
                # Gets the weather data from the response and saves it to the database
                data = response.json()
                print('Data: ', data)
                print('Headers: ', response.headers)
                query = Query.objects.create(
                    longitude=longitude, latitude=latitude, response=data.get('name'), user=user)
                query.save()
                print("Saved Query: ", query)
                # Adds the query_id to the weather data and returns it as a response
                return Response(data, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'Unable to determine location!'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f'Error: {e}')
        return Response({'message': 'Unable to determine location!'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_location(request):
    """
    This function is used to get the location of the user and return the weather data for that location."""
    user = request.user
    data = request.data
    print('Data: ', data)
    print('API_KEY: ', API_KEY)
    try:
        if not data:
            return Response({'message': 'No data provided'}, status=status.HTTP_400_BAD_REQUEST)
        location = data.get('location')

        # Checks if request data contains coordinates
        if location.get('coordinates'):
            # Gets the longitude and latitude from the coordinates
            latitude = location.get('coordinates').get('latitude')
            longitude = location.get('coordinates').get('longitude')
            # Creates the URL for the API request
            url = f'http://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={API_KEY}'
            response = requests.get(url)

            # Checks if the response is successful
            if response:
                # Gets the weather data from the response and saves it to the database
                data = response.json()
                print('Data: ', data)
                print('Headers: ', response.headers)
                query = Query.objects.create(
                    longitude=longitude, latitude=latitude, response=f"{data.get('name')}, {data.get('sys').get('country')}", user=user)
                query.save()
                print("Saved Query: ", query)

                # Adds the query_id to the weather data and returns it as a response
                data.update({'query_id': query.query_id})
                print(
                    f'Updated Data: {data}')
                return Response(data, status=status.HTTP_201_CREATED)
        # Checks if request data contains zip code and country code
        if location.get('zip_code') and location.get('country_code'):
            # Creates the URL for the API request
            zip_code = location.get('zip_code')
            country_code = location.get('country_code')
            # Creates the URL for the API request
            url = f'http://api.openweathermap.org/geo/1.0/zip?zip={zip_code},{country_code}&appid={API_KEY}'
            response = requests.get(url)
            # Checks if the response is successful
            if response:
                # Gets the weather data from the response and saves it to the database
                data = response.json()
                print('Headers: ', response.headers)
                query = Query.objects.create(
                    zip_code=zip_code, country_code=country_code, response=f"{data.get('name')}, {data.get('sys').get('country')}", user=user)
                query.save()
                print("Saved Query: ", query)
                # Adds the query_id to the weather data and returns it as a response
                data.update({'query_id': query.query_id})
                print(
                    f'Updated Data: {data}')
                return Response(data, status=status.HTTP_201_CREATED)

        # Checks if request data contains city name, state code, and country code
        if location.get('city_name') and location.get('state_code') and location.get('country_code'):
            city_name = location.get('city_name')
            state_code = location.get('state_code')
            country_code = location.get('country_code')
            # Creates the URL for the API request
            url = f'https://api.openweathermap.org/data/2.5/weather?q={city_name},{state_code},{country_code}&appid={API_KEY}'
            response = requests.get(url)
            # Checks if the response is successful
            if response:
                # Gets the weather data from the response and saves it to the database
                data = response.json()
                print('Headers: ', response.headers)
                query = Query.objects.create(
                    city_name=city_name, state_code=state_code, country_code=country_code, response=f"{data.get('name')}, {data.get('sys').get('country')}", user=user)
                query.save()
                print("Saved Query: ", query)
                # Adds the query_id to the weather data and returns it as a response
                data.update({'query_id': query.query_id})
                print(
                    f'Updated Data: {data}')
                return Response(data, status=status.HTTP_201_CREATED)

        # Checks if request data contains city name and country code
        if location.get('city_name') and location.get('state_code') and location.get('country_code'):
            city_name = location.get('city_name')
            country_code = location.get('country_code')
            # Creates the URL for the API request
            url = f'https://api.openweathermap.org/data/2.5/weather?q={city_name},{country_code}&appid={API_KEY}'
            response = requests.get(url)
            # Checks if the response is successful
            if response:
                # Gets the weather data from the response and saves it to the database
                data = response.json()
                print('Headers: ', response.headers)
                query = Query.objects.create(
                    city_name=city_name, country_code=country_code, response=f"{data.get('name')}, {data.get('sys').get('country')}", user=user)
                query.save()
                print("Saved Query: ", query)
                # Adds the query_id to the weather data and returns it as a response
                data.update({'query_id': query.query_id})
                print(
                    f'Updated Data: {data}')
                return Response(data, status=status.HTTP_201_CREATED)

        # Checks if request data contains city name
        if location.get('city_name'):
            city_name = location.get('city_name')
            url = f'https://api.openweathermap.org/data/2.5/weather?q={city_name}&appid={API_KEY}'
            response = requests.get(url)
            # Checks if the response is successful
            if response:
                # Gets the weather data from the response and saves it to the database
                data = response.json()
                print('Headers: ', response.headers)
                query = Query.objects.create(
                    city_name=city_name, response=f"{data.get('name')}, {data.get('sys').get('country')}", user=user)
                query.save()
                print("Saved Query: ", query)
                # Adds the query_id to the weather data and returns it as a response
                data.update({'query_id': query.query_id})
                print(
                    f'Updated Data: {data}')
                return Response(data, status=status.HTTP_201_CREATED)
        return Response({'message': 'Invalid location data'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f'Error: {e}')


@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_location(request, query_id):
    user = request.user
    data = request.data
    print('API_KEY: ', API_KEY)
    try:
        if not data:
            return Response({'message': 'No data provided'}, status=status.HTTP_400_BAD_REQUEST)
        location = data.get('location')
        # Checks if request data contains coordinates
        if location.get('coordinates'):
            latitude = float(location.get('coordinates').get('latitude')) if location.get(
                'coordinates').get('longitude') is not None else None
            longitude = float(location.get('coordinates').get('longitude')) if location.get(
                'coordinates').get('longitude') is not None else None
            url = f'http://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={API_KEY}'
            response = requests.get(url)
            # Checks if the response is successful
            if response:
                # Gets the weather data from the response and saves it to the database
                data = response.json()
                print('Data: ', data)
                print('Headers: ', response.headers)
                query = Query.objects.filter(
                    Q(user=user) & Q(query_id=query_id)).first()
                query.latitude = latitude
                query.longitude = longitude
                query.response = f"{data.get('name')}, {data.get('sys').get('country')}"
                query.save()
                print("Saved Query: ", query)
                # Adds the query_id to the weather data and returns it as a response
                data.update({'query_id': query.query_id})
                print(
                    f'Updated Data: {data}')
                return Response(data, status=status.HTTP_201_CREATED)
        # Checks if request data contains zip code and country code
        if location.get('zip_code') and location.get('country_code'):
            zip_code = location.get('zip_code')
            country_code = location.get('country_code')
            url = f'http://api.openweathermap.org/geo/1.0/zip?zip={zip_code},{country_code}&appid={API_KEY}'
            response = requests.get(url)
            # Checks if the response is successful
            if response:
                # Gets the weather data from the response and saves it to the database
                data = response.json()
                print('Headers: ', response.headers)
                query = Query.objects.filter(
                    Q(user=user) & Q(query_id=query_id)).first()
                query.zip_code = zip_code
                query.country_code = country_code
                query.response = f"{data.get('name')}, {data.get('sys').get('country')}"
                query.save()
                print("Saved Query: ", query)
                # Adds the query_id to the weather data and returns it as a response
                data.update({'query_id': query.query_id})
                print(
                    f'Updated Data: {data}')
                return Response(data, status=status.HTTP_201_CREATED)

        # Checks if request data contains city name, state code and country code
        if location.get('city_name') and location.get('state_code') and location.get('country_code'):
            city_name = location.get('city_name')
            state_code = location.get('state_code')
            country_code = location.get('country_code')
            url = f'https://api.openweathermap.org/data/2.5/weather?q={city_name},{state_code},{country_code}&appid={API_KEY}'
            response = requests.get(url)
            # Checks if the response is successful
            if response:
                # Gets the weather data from the response and saves it to the database
                data = response.json()
                print('Headers: ', response.headers)
                query = Query.objects.filter(
                    Q(user=user) & Q(query_id=query_id)).first()
                query.city_name = city_name
                query.state_code = state_code
                query.country_code = country_code
                query.response = f"{data.get('name')}, {data.get('sys').get('country')}"
                query.save()
                print("Saved Query: ", query)
                # Adds the query_id to the weather data and returns it as a response
                data.update({'query_id': query.query_id})
                print(
                    f'Updated Data: {data}')
                return Response(data, status=status.HTTP_201_CREATED)

        # Checks if request data contains city name and country code
        if location.get('city_name') and location.get('state_code') and location.get('country_code'):
            city_name = location.get('city_name')
            country_code = location.get('country_code')
            url = f'https://api.openweathermap.org/data/2.5/weather?q={city_name},{country_code}&appid={API_KEY}'
            response = requests.get(url)
            # Checks if the response is successful
            if response:
                # Gets the weather data from the response and saves it to the database
                data = response.json()
                print('Headers: ', response.headers)
                query = Query.objects.filter(
                    Q(user=user) & Q(query_id=query_id)).first()
                query.city_name = city_name
                query.country_code = country_code
                query.response = f"{data.get('name')}, {data.get('sys').get('country')}"
                query.save()
                print("Saved Query: ", query)
                # Adds the query_id to the weather data and returns it as a response
                data.update({'query_id': query.query_id})
                print(
                    f'Updated Data: {data}')
                return Response(data, status=status.HTTP_201_CREATED)

        # Checks if request data contains city name
        if location.get('city_name'):
            city_name = location.get('city_name')
            url = f'https://api.openweathermap.org/data/2.5/weather?q={city_name}&appid={API_KEY}'
            response = requests.get(url)
            # Checks if the response is successful
            if response:
                # Gets the weather data from the response and saves it to the database
                data = response.json()
                print('Headers: ', response.headers)
                query = Query.objects.filter(
                    Q(user=user) & Q(query_id=query_id)).first()
                query.city_name = city_name
                query.response = f"{data.get('name')}, {data.get('sys').get('country')}"
                query.save()
                print("Saved Query: ", query)
                # Adds the query_id to the weather data and returns it as a response
                data.update({'query_id': query.query_id})
                print(
                    f'Updated Data: {data}')
                return Response(data, status=status.HTTP_201_CREATED)
        return Response({'message': 'Invalid location data'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f'Error: {e}')


@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def delete_location(request, query_id):
    try:
        user = request.user
        query = Query.objects.filter(
            Q(user=user) & Q(query_id=query_id)).first()
        if query:
            query.delete()
            return Response({'message': 'Query deleted successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'Query not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f'Error: {e}')
        return Response({'message': 'Error deleting query'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class QueryHistoryView(ListAPIView):
    queryset = Query.objects.all()
    serializer_class = QuerySerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        user = self.request.user
        return Query.objects.filter(user=user).order_by('-created_at')


class VerifyToken(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('access')
        # print(f"Raw Token: {token}")
        if token:
            try:
                decoded_token = AccessToken(token)
                # print(f"Decoded Token: {decoded_token}")
                # print(f"Payload: {decoded_token.payload}")
                if decoded_token:
                    return Response({'message': 'Token is valid'}, status=status.HTTP_200_OK)
                else:
                    return Response({'message': 'Token is invalid'}, status=status.HTTP_401_UNAUTHORIZED)
            except Exception as e:
                return Response({'message': 'Token is invalid'}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({'message': 'Token not provided'}, status=status.HTTP_400_BAD_REQUEST)
