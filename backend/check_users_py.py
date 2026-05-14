import mongoengine
from app.models.user import User
from app.config import Config

def check_users():
    mongoengine.connect(host=Config.MONGO_URI)
    users = User.objects()
    print(f"Users found: {len(users)}")
    for u in users:
        print(f"- {u.email}")

if __name__ == "__main__":
    check_users()
