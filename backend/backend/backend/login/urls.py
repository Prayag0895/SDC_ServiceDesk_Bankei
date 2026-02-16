from django.urls import path
from .views import (
    LoginAPIView, RegistrationView, ListUsersAPIView, UpdateUserAPIView,
    get_departments, get_domains, get_pending_users, approve_user, reject_user,
    DepartmentAdminListCreateAPIView, DepartmentAdminDetailAPIView,
    SecondaryAdminListAPIView, CreateSecondaryAdminAPIView, ResetSecondaryAdminPasswordAPIView,
    DeleteSecondaryAdminAPIView
)

urlpatterns = [
    path('login/', LoginAPIView.as_view(), name='login'),
    path('register/', RegistrationView.as_view(), name='register-department'),
    path('users/', ListUsersAPIView.as_view(), name='list-users'),
    path('users/<int:id>/', UpdateUserAPIView.as_view(), name='update-user'),

    # FETCH ENDPOINTS
    path('departments/', get_departments, name='get-departments'),
    path('domains/', get_domains, name='get-domains'),

    # ADMIN DEPARTMENT CRUD
    path('departments/manage/', DepartmentAdminListCreateAPIView.as_view(), name='admin-departments'),
    path('departments/manage/<int:id>/', DepartmentAdminDetailAPIView.as_view(), name='admin-departments-detail'),

    # USER APPROVAL ENDPOINTS
    path('pending-users/', get_pending_users, name='get-pending-users'),
    path('users/<int:user_id>/approve/', approve_user, name='approve-user'),
    path('users/<int:user_id>/reject/', reject_user, name='reject-user'),

    # SECONDARY ADMIN MANAGEMENT
    path('admins/', SecondaryAdminListAPIView.as_view(), name='list-admins'),
    path('admins/create/', CreateSecondaryAdminAPIView.as_view(), name='create-admin'),
    path('admins/<int:id>/reset-password/', ResetSecondaryAdminPasswordAPIView.as_view(), name='reset-admin-password'),
    path('admins/<int:id>/delete/', DeleteSecondaryAdminAPIView.as_view(), name='delete-admin'),
]
