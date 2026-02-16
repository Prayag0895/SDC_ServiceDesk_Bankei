from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from rest_framework import status, generics, permissions
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from .models import User, Department, Domain
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import (
    DepartmentUserRegistrationSerializer, 
    DepartmentSerializer,
    UserSerializer, 
    CustomTokenSerializer 
)

class LoginAPIView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer


class RegistrationView(generics.CreateAPIView):
    serializer_class = DepartmentUserRegistrationSerializer
    permission_classes = [AllowAny]
    authentication_classes = []

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        if user.role == 'DEPARTMENT':
            message = "Registration successful. You can now login."
        else:
            message = "Registration successful. Your account is pending admin approval."
        
        return Response({
            "message": message,
            "username": user.username,
            "role": user.role,
        }, status=status.HTTP_201_CREATED)


class IsSuperUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser


class ListUsersAPIView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsSuperUser]


class UpdateUserAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsSuperUser]
    lookup_field = 'id'


class DepartmentAdminListCreateAPIView(generics.ListCreateAPIView):
    queryset = Department.objects.all().order_by('name')
    serializer_class = DepartmentSerializer
    permission_classes = [IsSuperUser]


class DepartmentAdminDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsSuperUser]
    lookup_field = 'id'


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_departments(request):
    departments = Department.objects.all()
    return Response([
        {
            "id": d.id,
            "name": d.name
        }
        for d in departments
    ])


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_domains(request):
    domains = Domain.objects.all()
    return Response([
        {
            "id": d.id,
            "value": d.value,
            "display": d.display
        }
        for d in domains
    ])


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_pending_users(request):
    """List all users pending approval (admin only)"""
    if not request.user.is_superuser:
        return Response(
            {"error": "Only administrators can view pending users"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    pending_users = User.objects.filter(
        is_approved=False
    ).exclude(role='DEPARTMENT').order_by('-date_joined')
    serializer = UserSerializer(pending_users, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def approve_user(request, user_id):
    """Approve a pending user (admin only)"""
    if not request.user.is_superuser:
        return Response(
            {"error": "Only administrators can approve users"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        user = User.objects.get(id=user_id)
        user.is_approved = True
        user.save()
        return Response({
            "message": f"User {user.username} has been approved",
            "user": UserSerializer(user).data
        })
    except User.DoesNotExist:
        return Response(
            {"error": "User not found"},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reject_user(request, user_id):
    """Reject/delete a pending user (admin only)"""
    if not request.user.is_superuser:
        return Response(
            {"error": "Only administrators can reject users"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        user = User.objects.get(id=user_id)
        username = user.username
        user.delete()
        return Response({
            "message": f"User {username} has been rejected and removed"
        })
    except User.DoesNotExist:
        return Response(
            {"error": "User not found"},
            status=status.HTTP_404_NOT_FOUND
        )


class SecondaryAdminListAPIView(generics.ListAPIView):
    """List all secondary admins (non-primary admins)"""
    serializer_class = UserSerializer
    permission_classes = [IsSuperUser]
    
    def get_queryset(self):
        return User.objects.filter(is_superuser=True).exclude(id=self.request.user.id).order_by('date_joined')


class CreateSecondaryAdminAPIView(generics.CreateAPIView):
    """Create a new secondary admin account"""
    serializer_class = UserSerializer
    permission_classes = [IsSuperUser]
    
    def create(self, request, *args, **kwargs):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not all([username, email, password]):
            return Response(
                {"error": "username, email, and password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(username=username).exists():
            return Response(
                {"error": "Username already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "Email already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        
        return Response(
            {
                "message": f"Secondary admin {username} created successfully",
                "user": UserSerializer(user).data
            },
            status=status.HTTP_201_CREATED
        )


class ResetSecondaryAdminPasswordAPIView(generics.UpdateAPIView):
    """Reset password for a secondary admin"""
    queryset = User.objects.all()
    permission_classes = [IsSuperUser]
    lookup_field = 'id'
    
    def update(self, request, *args, **kwargs):
        user = self.get_object()
        new_password = request.data.get('password')
        
        if not new_password:
            return Response(
                {"error": "password is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if user.id == request.user.id:
            return Response(
                {"error": "Cannot reset your own password via this endpoint"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(new_password)
        user.save()
        
        return Response({
            "message": f"Password reset successfully for {user.username}"
        })


class DeleteSecondaryAdminAPIView(generics.DestroyAPIView):
    """Delete a secondary admin account"""
    queryset = User.objects.all()
    permission_classes = [IsSuperUser]
    lookup_field = 'id'
    
    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        
        if user.id == request.user.id:
            return Response(
                {"error": "Cannot delete your own admin account"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not user.is_superuser:
            return Response(
                {"error": "Can only delete secondary admin accounts"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        username = user.username
        user.delete()
        
        return Response({
            "message": f"Secondary admin {username} deleted successfully"
        })




