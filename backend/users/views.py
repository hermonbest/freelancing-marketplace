# backend/users/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from .models import User
from .serializers import UserSerializer, LoginSerializer
# users/views.py
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse

@ensure_csrf_cookie
def csrf(request):
    return JsonResponse({"message": "CSRF cookie set"})

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

# --- Corrected logout_view ---
# Use @authentication_classes([]) to bypass DRF's default session auth context
# which often triggers CSRF checks. Keep @permission_classes([AllowAny]).
@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([]) # Explicitly disable all authentication classes
def logout_view(request):
    """
    Logout the user by invalidating the session.
    Explicitly allows any origin and bypasses all authentication/permission classes
    that might trigger CSRF checks.
    """
    logout(request)
    return Response({'message': 'Logout successful'})

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
@api_view(['GET'])
def current_user(request):
    """
    Get the currently authenticated user's details.
    """
    if request.user.is_authenticated:
        # Use your custom UserSerializer
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    else:
        # Return a 401 if not authenticated
        # The global permission class (IsAuthenticated) might handle this,
        # but an explicit check is often clearer.
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

