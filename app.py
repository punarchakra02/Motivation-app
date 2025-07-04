
import os
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import google.generativeai as genai


load_dotenv()


app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'your-default-secret-key')


genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

model = genai.GenerativeModel('models/gemini-1.5-flash')

MOOD_PROMPTS = {
    'anxious': """Generate a calming motivational sentence for someone feeling anxious. 
    Only return a single motivational sentence — no JSON, no formatting. Max 150 characters.""",

    'focus': """Generate an inspiring motivational sentence for someone needing focus and clarity.
    Only return a single motivational sentence — no JSON, no formatting. Max 150 characters.""",

    'tired': """Generate an encouraging motivational sentence for someone feeling tired or burned out. 
    Only return a single motivational sentence — no JSON, no formatting. Max 150 characters.""",

    'confident': """Generate an empowering motivational sentence for someone who needs confidence.
    Only return a single motivational sentence — no JSON, no formatting. Max 150 characters.""",

    'overwhelmed': """Generate a calming and clear motivational sentence for someone who feels overwhelmed. 
    Only return a single motivational sentence — no JSON, no formatting. Max 150 characters.""",

    'procrastinating': """Generate a direct and motivational sentence for someone who is procrastinating. 
    Only return a single motivational sentence — no JSON, no formatting. Max 150 characters."""
}


FALLBACK_MOTIVATIONS = {
    'anxious': 'You have been assigned this mountain to show others it can be moved.',
    'focus': 'The successful warrior is the average person with laser-like focus.',
    'tired': 'Rest when you\'re weary. Refresh and renew your body and mind.',
    'confident': 'Believe you can and you\'re halfway there.',
    'overwhelmed': 'You don\'t have to see the whole staircase, just take the first step.',
    'procrastinating': 'The best time to start was yesterday. The next best time is now.'
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate-motivation', methods=['POST'])
def generate_motivation():
    try:
        data = request.get_json()
        mood = data.get('mood')

        if not mood or mood not in MOOD_PROMPTS:
            return jsonify({'error': 'Invalid mood selected'}), 400

        prompt = MOOD_PROMPTS[mood]

        try:
            response = model.generate_content(prompt)
            response_text = response.text.strip()

            return jsonify({
                'success': True,
                'motivation': {
                    'text': response_text,
                    'type': 'affirmation'
                }
            })

        except Exception as gemini_error:
            print(f"Gemini API error: {gemini_error}")
            return jsonify({
                'success': True,
                'motivation': {
                    'text': FALLBACK_MOTIVATIONS[mood],
                    'type': 'fallback'
                },
                'fallback': True
            })

    except Exception as e:
        print(f"General error: {e}")
        return jsonify({'error': 'Something went wrong. Please try again.'}), 500

@app.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'api_configured': bool(os.getenv('GEMINI_API_KEY'))
    })

if __name__ == '__main__':
    if not os.getenv('GEMINI_API_KEY'):
        print("⚠️ WARNING: GEMINI_API_KEY not found in .env file.")
    app.run(debug=True, host='0.0.0.0', port=5000)
