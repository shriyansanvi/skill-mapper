from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Skill, Resume, BusinessProfile, GovtProfile
from .models import Skill, Resume, BusinessProfile, GovtProfile, JobPosting
from .models import SelfHelpGroup
from .models import PortfolioImage

# --- Authentication Serializers ---

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for handling user registration.
    """
    class Meta:
        model = User
        fields = ['username', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Customizes the JWT token to include the user's username
    and whether they are an "employer".
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        
        # Check if user is an employer
        is_employer = (
            BusinessProfile.objects.filter(user=user).exists() or
            GovtProfile.objects.filter(user=user).exists()
        )
        token['is_employer'] = is_employer

        return token

# --- Model Serializers ---

class SkillSerializer(serializers.ModelSerializer):
    """
    Serializer for the Skill model.
    """
    class Meta:
        model = Skill
        fields = ['id', 'name']

class ResumeSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = Resume
        fields = [
            'id', 'full_name', 'contact_email', 'contact_phone', 
            'location', 'bio', 'experience', 'education', 
            'availability', 'skills', 'is_verified'
        ]
class BusinessProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the BusinessProfile model.
    """
    class Meta:
        model = BusinessProfile
        fields = '__all__' # Includes all fields from the model

class GovtProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the GovtProfile model.
    """
    class Meta:
        model = GovtProfile
        fields = '__all__' # Includes all fields from the model

class JobPostingSerializer(serializers.ModelSerializer):
    """
    Serializer for the JobPosting model.
    """
    # We'll show the skill names, not just their IDs
    required_skills = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = JobPosting
        fields = [
            'id', 
            'title', 
            'company_name', 
            'location', 
            'job_type', 
            'description', 
            'required_skills',
            'posted_by'
        ]

class SelfHelpGroupSerializer(serializers.ModelSerializer):
    """
    Serializer for the SelfHelpGroup model.
    """
    class Meta:
        model = SelfHelpGroup
        fields = ['id', 'name', 'topic', 'member_count', 'location']

class PortfolioImageSerializer(serializers.ModelSerializer):
    """
    Serializer for the PortfolioImage model.
    """
    image = serializers.ImageField() # Use ImageField for uploads

    class Meta:
        model = PortfolioImage
        fields = ['id', 'resume', 'image', 'caption', 'uploaded_at']
        read_only_fields = ['resume'] # Resume will be set from the view