# backend/users/views.py
from django.http import HttpResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from .models import User
from .serializers import UserSerializer, LoginSerializer
# Import necessary decorators for CSRF exemption
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import wraps

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'user': UserSerializer(user).data,
            'message': 'User created successfully'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return Response({
                'user': UserSerializer(user).data,
                'message': 'Login successful'
            })
        else:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- Corrected and single logout_view definition ---
@api_view(['POST'])
@permission_classes([AllowAny])
@wraps(csrf_exempt) # Apply csrf_exempt using wraps to bypass CSRF checks for this DRF view
def logout_view(request):
    """
    Logout the user by invalidating the session.
    Explicitly allows any origin and bypasses CSRF checks.
    """
    logout(request)
    logout(request)  # clears session on server side
    response = Response({'message': 'Logout successful'})

    # Explicitly expire cookies (attributes must match how they were set)
    response.delete_cookie(
        key='sessionid',
        path='/',
        secure=True,
        samesite='None',
        httponly=True,
    )
    response.delete_cookie(
        key='csrftoken',
        path='/',
        secure=True,
        samesite='None',
        httponly=False,  # csrf cookie is not HttpOnly so frontend can read it
    )

    return response
    return response
# --- End of logout_view ---

@api_view(['GET'])
def current_user(request):
    if request.user.is_authenticated:
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    else:
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['PUT'])
def update_profile(request):
    if request.user.is_authenticated:
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
