from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.hashers import make_password, check_password as django_check_password
from django.utils.crypto import get_random_string
from django.core.mail import send_mail
from weatherproject import settings
# Create your models here.


class UsersManager(models.Manager):
    def get_by_natural_key(self, email):
        return self.get(email=email)


class User(models.Model):
    user_id = models.BigAutoField(auto_created=True, primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)
    reset_token = models.CharField(max_length=100, null=True, blank=True)
    USERNAME_FIELD = 'email'  # Specify the unique field for authentication
    # Optional fields required for creating a superuser
    REQUIRED_FIELDS = ['first_name', 'last_name']
    is_anonymous = False
    _is_superuser = True
    is_staff = True
    is_active = True
    objects = UsersManager()
    # Custom method to check if the user is authenticated

    @property
    def is_authenticated(self):
        # Indicates that this user is authenticated
        return True

    @property
    def is_superuser(self):
        # Indicates that this user is a superuser
        return self._is_superuser

    @is_superuser.setter
    def is_superuser(self, value: bool):
        self._is_superuser = value

    def has_perm(self, perm, obj=None):
        # Indicates that this user has all permissions
        return True

    def has_module_perms(self, app_label):
        # Indicates that this user has permissions to access all modules
        return True

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    # Custom method to check password
    def check_password(self, raw_password):
        return django_check_password(raw_password, self.password)

    def __str__(self):
        return self.first_name + " " + self.last_name


class Query(models.Model):
    query_id = models.BigAutoField(auto_created=True, primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    longitude = models.FloatField(null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    zipcode = models.CharField(max_length=100, null=True, blank=True)
    city_name = models.CharField(max_length=100, null=True, blank=True)
    country_code = models.CharField(max_length=100, null=True, blank=True)
    state_code = models.CharField(max_length=100, null=True, blank=True)
    response = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    def __str__(self):
        return str(self.response)


class ResetTokenAuthentication:
    """Class for generating reset token for password reset"""

    def send_password_reset_email(self, user, link):
        """Sends password reset token to user"""
        subject = "Password Reset Link"
        message = f"""Hello {user.first_name}, \n
        Please click the following link to reset your password:{link}"""
        send_mail(subject, message,
                  f'{settings.EMAIL_HOST_USER}', [user.email])

    def generate_token(self):
        """Generates the reset token"""
        return get_random_string(length=32)
