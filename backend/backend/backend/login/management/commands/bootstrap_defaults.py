from django.core.management.base import BaseCommand
from django.core.management import call_command


class Command(BaseCommand):
    help = "Ensure default admin and seed master/demo data exist"

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Ensuring default admin exists..."))
        call_command("seed_admin")

        self.stdout.write(self.style.NOTICE("Ensuring departments/domains exist..."))
        call_command("seed_departments")

        self.stdout.write(self.style.NOTICE("Ensuring ticket/request types exist..."))
        call_command("seed_ticket_types")

        self.stdout.write(self.style.NOTICE("Ensuring demo users exist..."))
        call_command("seed_users")

        self.stdout.write(self.style.SUCCESS("Bootstrap defaults complete."))
