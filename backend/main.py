from flask import Flask, jsonify, request
from flask_cors import CORS
from typing import List, Optional, Dict, Any
from datetime import datetime

app = Flask(__name__)
CORS(app)

announcements = [
    {
        "id": 1,
        "title": "Celebrating Teamwork – Manvian Fun Fiesta 2025! 🎉",
        "message": "We had an fun evening filled with laughter, learning, and lively interactions during our Manvian Fun Fiesta.",
        "author": "S.Santhana Lakshmi",
        "date": "August 22, 10:30 am",
        "type": "Event",
        "reactions": "👍 🥰 10 person",
        "author_img": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
        "id": 2,
        "title": "Happy Birthday, Aiswarya! 🥳🎂",
        "message": "We are excited to celebrate the special day of Aiswarya today! Please join us in wishing her a wonderful birthday filled with happiness. ❤️",
        "author": "S.Santhana Lakshmi",
        "date": "August 22, 10:30 am",
        "type": "Birthday",
        "reactions": "👍 🥰 10 person",
        "author_img": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
        "id": 3,
        "title": "Employee of the Month, Sakshi 🌟",
        "message": "We are delighted to announce that Sakshi has been selected as our Employee of the Week! Congratulations on your hard work! 🎊",
        "author": "S.Santhana Lakshmi",
        "date": "August 22, 10:30 am",
        "type": "Event",
        "reactions": "👍 🥰 10 person",
        "author_img": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    }
]

# Sidebar config
sidebar_config = [
    {"name": "Dashboard", "icon": "LayoutDashboard", "path": "/"},
    {"name": "Organization", "icon": "Building2", "hasSub": True},
    {"name": "Approval", "icon": "CheckSquare", "hasSub": True},
    {"name": "Leave", "icon": "Calendar", "hasSub": True},
    {"name": "Reports", "icon": "BarChart3", "hasSub": True},
    {"name": "Documentation", "icon": "FileText", "hasSub": True},
    {"name": "Attendance", "icon": "UserCheck", "path": "/attendance"},
]

# Hero card data
hero_data = {
    "weather_icon": "☀️",
    "event_title": "Standup Meeting",
    "event_count": "02 Min Left",
    "avatars": [
        "https://i.pravatar.cc/30?u=1",
        "https://i.pravatar.cc/30?u=2"
    ],
    "more_avatars": "+9",
    "illustration_url": "https://static.vecteezy.com/system/resources/previews/002/144/326/original/modern-worker-is-looking-for-information-on-the-internet-flat-illustration-concept-free-vector.jpg"
}

# Dashboard data
user_data = {
    "name": "Lakshmi",
    "role": "HR",
    "img": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    "pending_approvals": 11,
    "leave_requests": 4
}

dashboard_stats = [
    {"title": "150", "sub": "Total Employees", "desc": "2 new employees added!", "icon": "👥", "color": "#E1F5FE"},
    {"title": "110", "sub": "On Time", "desc": "Check Attendance Today", "icon": "⏱️", "color": "#E0F7FA"},
    {"title": "20", "sub": "On Leave", "desc": "Accept or Reject Leave", "icon": "☁️", "color": "#E1F5FE"},
    {"title": "20", "sub": "Late Arrival", "desc": "Check Attendance Overview", "icon": "📉", "color": "#E1F5FE"},
    {"title": "02", "sub": "Pending Approval", "desc": "Approve Leave", "icon": "🕒", "color": "#E0F7FA"},
    {"title": "01", "sub": "This Week Holiday", "desc": "Independence Day (Fri, 15 Aug)", "icon": "📅", "color": "#E1F5FE"},
]

attendance_data = {
    "months": ["Jan", "Feb", "Mar", "Apr", "May"],
    "values": [70, 85, 95, 80, 88]
}

@app.route("/", methods=["GET"])
def welcome():
    return jsonify({
        "status": "online",
        "message": "StafiO API is running. Use /docs for interactive documentation.",
        "endpoints": {
            "documentation": "/docs",
            "api_spec": "/openapi.json"
        }
    })

# OpenAPI Specification object
@app.route("/openapi.json", methods=["GET"])
def get_openapi_spec():
    return jsonify({
        "openapi": "3.0.0",
        "info": {
            "title": "StafiO API",
            "description": "Interactive API documentation for the StafiO Dashboard",
            "version": "1.0.0"
        },
        "paths": {
            "/announcements": {
                "get": {
                    "summary": "Get all announcements",
                    "responses": {"200": {"description": "A list of announcements"}}
                },
                "post": {
                    "summary": "Create a new announcement",
                    "requestBody": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "title": {"type": "string"},
                                        "message": {"type": "string"},
                                        "author": {"type": "string"},
                                        "type": {"type": "string"}
                                    }
                                }
                            }
                        }
                    },
                    "responses": {"201": {"description": "Created"}}
                }
            },
            "/user": {
                "get": {
                    "summary": "Get current user profile",
                    "responses": {"200": {"description": "User profile data"}}
                }
            },
            "/stats": {
                "get": {
                    "summary": "Get dashboard statistics",
                    "responses": {"200": {"description": "Stats like total employees, pending approvals, etc."}}
                }
            },
            "/attendance": {
                "get": {
                    "summary": "Get attendance chart data",
                    "responses": {"200": {"description": "Monthly attendance values"}}
                }
            },
            "/sidebar": {
                "get": {
                    "summary": "Get sidebar navigation config",
                    "responses": {"200": {"description": "Sidebar items and icons"}}
                }
            },
            "/hero": {
                "get": {
                    "summary": "Get hero card data",
                    "responses": {"200": {"description": "Weather, events, and avatars"}}
                }
            }
        }
    })

@app.route("/docs", methods=["GET"])
def get_docs():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>StafiO API - Swagger UI</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({
            url: '/openapi.json',
            dom_id: '#swagger-ui',
          });
        };
      </script>
    </body>
    </html>
    """

@app.route("/sidebar", methods=["GET"])
def get_sidebar():
    return jsonify(sidebar_config)

@app.route("/hero", methods=["GET"])
def get_hero():
    return jsonify(hero_data)

@app.route("/user", methods=["GET"])
def get_user():
    return jsonify(user_data)

@app.route("/stats", methods=["GET"])
def get_stats():
    return jsonify(dashboard_stats)

@app.route("/attendance", methods=["GET"])
def get_attendance():
    return jsonify(attendance_data)

@app.route("/announcements", methods=["GET"])
def get_announcements():
    return jsonify(announcements)

@app.route("/announcements", methods=["POST"])
def create_announcement():
    data = request.json
    new_announcement = {
        "id": len(announcements) + 1,
        "title": data.get("title"),
        "message": data.get("message"),
        "author": data.get("author"),
        "date": data.get("date"),
        "type": data.get("type"),
        "reactions": data.get("reactions", "👍 🥰 10 person"),
        "author_img": data.get("author_img", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80")
    }
    announcements.insert(0, new_announcement)
    return jsonify(new_announcement), 201

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
