import os
from app import create_app, db
from app.dummy_data.seeder import seed_database

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        # Ensure database tables and seed data exist
        db.create_all()
        seed_database()

    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'True').lower() in ['true', '1']
    print(f"Starting BidShield AI Backend on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
