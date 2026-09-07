"""
Vercel serverless function entry point for BidShield AI
"""
import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app import create_app, db

app = create_app()

# Initialize database on first request
with app.app_context():
    db.create_all()
    # Seed database with dummy data
    try:
        from app.dummy_data.seeder import seed_database
        seed_database()
    except Exception as e:
        print(f"Seeding skipped or already done: {e}")

# This is the WSGI application Vercel will use
def handler(request, context):
    return app(request.environ, context)

# For local testing
if __name__ == '__main__':
    app.run(debug=True)
