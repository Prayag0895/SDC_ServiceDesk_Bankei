from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "List all users in the database"

    def handle(self, *args, **options):
        users = User.objects.all().order_by('-is_superuser', 'role', 'username')
        
        self.stdout.write("\n" + "="*80)
        self.stdout.write(self.style.SUCCESS("ALL USERS IN DATABASE"))
        self.stdout.write("="*80 + "\n")
        
        for user in users:
            superuser_flag = "🔑 SUPERUSER" if user.is_superuser else ""
            approved_flag = "✓" if user.is_approved else "✗"
            
            self.stdout.write(
                f"  {approved_flag} {user.username:20} | Role: {user.role:12} | "
                f"Email: {user.email:30} {superuser_flag}"
            )
        
        self.stdout.write("\n" + "-"*80)
        self.stdout.write(f"Total Users: {users.count()}")
        self.stdout.write(f"Approved: {User.objects.filter(is_approved=True).count()}")
        self.stdout.write(f"Pending: {User.objects.filter(is_approved=False).count()}")
        self.stdout.write("-"*80 + "\n")
