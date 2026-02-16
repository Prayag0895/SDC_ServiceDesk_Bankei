from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "Create hardcoded admin superuser (username: admin, password: 123)"

    def handle(self, *args, **options):
        admin_username = "admin"
        admin_password = "123"
        admin_email = "admin@sdc.gov.in"

        # Check if admin already exists
        if User.objects.filter(username=admin_username).exists():
            admin = User.objects.get(username=admin_username)
            
            # Update password and ensure superuser status
            admin.set_password(admin_password)
            admin.is_superuser = True
            admin.is_staff = True
            admin.is_approved = True
            admin.is_active = True
            admin.email = admin_email
            admin.save()
            
            self.stdout.write(self.style.SUCCESS(f"Admin user '{admin_username}' updated"))
        else:
            # Create new admin
            admin = User.objects.create_superuser(
                username=admin_username,
                email=admin_email,
                password=admin_password
            )
            admin.is_approved = True
            admin.role = 'OFFICER'  # Give highest role for UI purposes
            admin.save()
            
            self.stdout.write(self.style.SUCCESS(f"Admin user '{admin_username}' created"))

        self.stdout.write(self.style.WARNING(f"Admin username: {admin_username}"))
        self.stdout.write(self.style.WARNING(f"Admin password: {admin_password}"))
