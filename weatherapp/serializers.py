from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import *


class UserRegistrationSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        exclude = ['reset_token']
        read_only_fields = ['user_id']

    def create(self, validated_data):
        # Remove confirm_password from validated_data before creating the user
        validated_data.pop('confirm_password')
        # Use validated_data to create the user
        return User.objects.create(**validated_data)


class UserPasswordResetSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=False)  # Extra Field

    class Meta:
        model = User
        fields = ['password', 'confirm_password']


class QuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = Query
        fields = '__all__'


class CustomAuthenticationBackend(BaseBackend):
    """Custom authentication backend to authenticate users using email and password"""

    def authenticate(self, request, email=None, password=None, **kwargs):
        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                return user
        except User.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom TokenObtainPairSerializer to include user details in the response"""

    def validate(self, attr):
        data = super().validate(attr)
        email = attr.get('email')
        password = attr.get('password')

        # Use custom authentication backend
        user = authenticate(email=email, password=password)

        if not user:
            raise serializers.ValidationError(
                "No active account found with the given credentials")
        data['user_id'] = self.user.user_id
        data['first_name'] = self.user.first_name
        return data
