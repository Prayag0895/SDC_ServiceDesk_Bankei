from rest_framework.permissions import BasePermission

def is_admin_user(request):
    return request.user.is_authenticated and request.user.is_superuser

class IsDepartmentUser(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            (request.user.role == 'DEPARTMENT' or is_admin_user(request))
        )

class IsDITUser(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            (request.user.role == 'DIT' or is_admin_user(request))
        )

class IsSDCUser(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            (request.user.role == 'SDC' or is_admin_user(request))
        )
    
class IsOfficer(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            (request.user.role == 'OFFICER' or is_admin_user(request))
        )


class IsSuperUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser