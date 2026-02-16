from django.core.management.base import BaseCommand
from tickets.models import TicketType, RequestType


class Command(BaseCommand):
    help = "Seed ticket types and request types"

    def handle(self, *args, **options):
        seed_data = {
            "Hardware": [
                "Laptop Issue",
                "Desktop Issue",
                "Printer Issue",
                "Peripheral Issue",
            ],
            "Software": [
                "Application Install",
                "Application Error",
                "License Request",
                "Update Request",
            ],
            "Network": [
                "WiFi Issue",
                "LAN Issue",
                "VPN Issue",
                "Internet Down",
            ],
            "Accounts": [
                "Password Reset",
                "Account Lockout",
                "New Account",
                "Email Issue",
            ],
            "Access": [
                "System Access",
                "Folder Access",
                "Database Access",
                "Role Change",
            ],
        }

        ticket_type_created = 0
        ticket_type_existing = 0
        request_type_created = 0
        request_type_existing = 0

        for ticket_type_name, request_types in seed_data.items():
            ticket_type, created = TicketType.objects.get_or_create(
                name=ticket_type_name
            )
            if created:
                ticket_type_created += 1
            else:
                ticket_type_existing += 1

            for request_type_name in request_types:
                request_type, req_created = RequestType.objects.get_or_create(
                    ticket_type=ticket_type,
                    name=request_type_name,
                )
                if req_created:
                    request_type_created += 1
                else:
                    request_type_existing += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Ticket types - Created: {ticket_type_created}, Existing: {ticket_type_existing}"
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                f"Request types - Created: {request_type_created}, Existing: {request_type_existing}"
            )
        )
