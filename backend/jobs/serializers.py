from rest_framework import serializers
from .models import Job, JobApplication
from users.serializers import UserSerializer

class JobSerializer(serializers.ModelSerializer):
    client = UserSerializer(read_only=True)
    
    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ('client', 'created_at', 'updated_at')
        
    def validate_title(self, value):
        if not value or len(value.strip()) < 3:
            raise serializers.ValidationError("Title must be at least 3 characters long.")
        return value.strip()
        
    def validate_description(self, value):
        if not value or len(value.strip()) < 10:
            raise serializers.ValidationError("Description must be at least 10 characters long.")
        return value.strip()
        
    def validate_category(self, value):
        valid_categories = [choice[0] for choice in Job.CATEGORY_CHOICES]
        if value not in valid_categories:
            raise serializers.ValidationError("Invalid category selected.")
        return value
        
    def validate_experience_level(self, value):
        valid_levels = [choice[0] for choice in Job.EXPERIENCE_LEVEL_CHOICES]
        if value not in valid_levels:
            raise serializers.ValidationError("Invalid experience level selected.")
        return value

class JobApplicationSerializer(serializers.ModelSerializer):
    freelancer = UserSerializer(read_only=True)
    job = JobSerializer(read_only=True)
    
    class Meta:
        model = JobApplication
        fields = '__all__'
        read_only_fields = ('freelancer', 'job', 'created_at', 'updated_at')

class CreateJobApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobApplication
        fields = ('cover_letter', 'bid_amount')
        
    def validate_cover_letter(self, value):
        if not value or len(value.strip()) < 10:
            raise serializers.ValidationError("Cover letter must be at least 10 characters long.")
        return value.strip()
        
    def validate_bid_amount(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("Bid amount must be greater than zero.")
        return value