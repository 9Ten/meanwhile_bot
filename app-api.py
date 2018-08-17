from flask import Flask
from flask_restful import Resource, Api
from flask.ext.mysql import MySQL

app = Flask(__name__)
api = Api(app)

mysql = MySQL()

# MySQL configurations
app.config['MYSQL_DATABASE_USER'] = 'jay'
app.config['MYSQL_DATABASE_PASSWORD'] = 'jay'
app.config['MYSQL_DATABASE_DB'] = 'ItemListDb'
app.config['MYSQL_DATABASE_HOST'] = 'localhost'

class CreateUser(Resource):
    def post(self):
        return {'status': 'success'}

api.add_resource(CreateUser, '/CreateUser')

if __name__ == '__main__':
    app.run(debug=True)
    app.run(host='0.0.0.0', port=8080)