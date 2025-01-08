from flask import Blueprint, request, jsonify
from .services import generate_ai_response

autogen_routes = Blueprint("autogen", __name__)

@autogen_routes.route("/response", methods=["POST"])
def get_response():
    data = request.json
    input_text = data.get("input", "")
    if not input_text:
        return jsonify({"error": "Input text is required"}), 400

    try:
        response = generate_ai_response(input_text)
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
