from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Job, JobApplication
from .serializers import JobSerializer, JobApplicationSerializer, CreateJobApplicationSerializer
from users.models import User

@api_view(['GET'])
@permission_classes([AllowAny])  # Make job listing public
def job_list(request):
    # Filter jobs by category if provided
    category = request.GET.get('category', None)
    
    if category:
        jobs = Job.objects.filter(is_active=True, category=category)
    else:
        jobs = Job.objects.filter(is_active=True)
    
    # Order by newest first
    jobs = jobs.order_by('-created_at')
    
    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])  # Make job detail public
def job_detail(request, job_id):
    job = get_object_or_404(Job, id=job_id, is_active=True)
    serializer = JobSerializer(job)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Only authenticated clients can post jobs
def create_job(request):
    if request.user.user_type != 'client':
        return Response({'error': 'Only clients can post jobs'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = JobSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(client=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Only authenticated clients can view their jobs
def my_jobs(request):
    if request.user.user_type != 'client':
        return Response({'error': 'Only clients can view their jobs'}, status=status.HTTP_403_FORBIDDEN)
    
    jobs = Job.objects.filter(client=request.user).order_by('-created_at')
    serializer = JobSerializer(jobs, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Only authenticated freelancers can view their applications
def my_applications(request):
    if request.user.user_type != 'freelancer':
        return Response({'error': 'Only freelancers can view their applications'}, status=status.HTTP_403_FORBIDDEN)
    
    applications = JobApplication.objects.filter(freelancer=request.user).select_related('job', 'job__client').order_by('-created_at')
    serializer = JobApplicationSerializer(applications, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Only authenticated freelancers can apply
def apply_to_job(request, job_id):
    if request.user.user_type != 'freelancer':
        return Response({'error': 'Only freelancers can apply to jobs'}, status=status.HTTP_403_FORBIDDEN)
    
    job = get_object_or_404(Job, id=job_id, is_active=True)
    
    # Check if freelancer has already applied
    if JobApplication.objects.filter(job=job, freelancer=request.user).exists():
        return Response({'error': 'You have already applied to this job'}, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = CreateJobApplicationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(job=job, freelancer=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Only job owners can see applications
def job_applications(request, job_id):
    job = get_object_or_404(Job, id=job_id, client=request.user)
    
    applications = JobApplication.objects.filter(job=job).select_related('freelancer').order_by('-created_at')
    serializer = JobApplicationSerializer(applications, many=True)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_application_status(request, application_id):
    application = get_object_or_404(JobApplication, id=application_id)
    
    # Only the client who posted the job can update application status
    if application.job.client != request.user:
        return Response({'error': 'You do not have permission to update this application'}, status=status.HTTP_403_FORBIDDEN)
    
    status_value = request.data.get('status')
    if status_value not in ['accepted', 'rejected']:
        return Response({'error': 'Invalid status. Must be "accepted" or "rejected"'}, status=status.HTTP_400_BAD_REQUEST)
    
    application.status = status_value
    application.save()
    
    serializer = JobApplicationSerializer(application)
    return Response(serializer.data)