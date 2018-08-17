# -*- coding: utf-8 -*-
from flask import Flask 
# redirect, url_for

#=== TO do cross-origin AJAX possible ===#
from flask_cors import CORS
from flask_pymongo import PyMongo
from flask_restful import Api, Resource, reqparse, abort

#=== To do handle data ===#
from collections import Counter
import datetime
import config

#=== normalization ===#
import numpy as np
import pandas as pd

app = Flask(__name__)
# To allow CORS for all domains on all routes.
CORS(app)
APP_CONFIG = config.APP_CONFIG
PRODUCTION = config.PRODUCTION

if PRODUCTION:
    CPU_CORE = config.CPU_CORE
    NUM_ROOM = config.NUM_ROOM
    NUM_TAG = config.NUM_TAG
    NUM_FOLLOWING = config.NUM_FOLLOWING
    NUM_NEIGHBOUR = config.NUM_NEIGHBOUR
    NUM_TOPIC = config.NUM_TOPIC

#=== mongoDB Config ===#
env = config.ENV_CONFIG
if env == "DevConfig":
    DATABASE_CONFIG = config.DevConfig.DATABASE_CONFIG
    dbname = config.DevConfig.DBNAME
elif env == "ProductConfig":
    DATABASE_CONFIG = config.ProductConfig.DATABASE_CONFIG
    dbname = config.ProductConfig.DBNAME
else:
    print("Error Env.")
    raise ValueError


app.config['MONGO_HOST'] = DATABASE_CONFIG[dbname]['host']
app.config['MONGO_PORT'] = DATABASE_CONFIG[dbname]['port']
app.config['MONGO_DBNAME'] = dbname
app.config['MONGO_USERNAME'] = DATABASE_CONFIG[dbname]['username']
app.config['MONGO_PASSWORD'] = DATABASE_CONFIG[dbname]['password']
mongo = PyMongo(app, config_prefix='MONGO')


def abort_if_user_doesnt_exist(_id):
    col_cf_user_profile = mongo.db.cf_user_profile_parallel
    if col_cf_user_profile.find({'mid': _id}, {'_id': 1}).limit(1) is None:
        abort(404, message="user {} doesn't exist".format(_id))


def check_cold_start(_id):
    col_cf_user_profile = mongo.db.cf_user_profile_parallel
    if len(list(col_cf_user_profile.find({'mid': _id}, {'stat': 1}).limit(1))['stat']) < 2:
        abort(404, message="user {} new user".format(uid))


class UserBehavior(Resource):
    def get(self, mid=None, cookie=None):
        col_pt_cs_day = mongo.db.pt_cs_day_test
        col_pt_user_behavior_global = mongo.db.pt_user_behavior_global
        col_members = mongo.db.members
        col_pt_Gender_Prediction = mongo.db.pt_Gender_Prediction
        col_topics = mongo.db.topics
        return
   

class UserBehaviorStats(Resource):
    def get(self, mid=None, cid=None):
        return


class UserBehaviorRooms(Resource):
    def __init__(self):
        self.col_cf_user_profile_parallel = mongo.db.cf_user_profile_parallel
        self.room = {
            'mid': 1,
            'cookie': 1,
            'rooms_tf': 1
        }
        self.status = 'one-many'

    def get(self, mid=None, cid=None):
        return


class UserBehaviorTags(Resource):
    def get(self, mid=None, cid=None):
        check_cold_start(uid)
        return


# user_behavior (following)
class UserBehaviorFollowing(Resource):
    def __init__(self):
        self.col_members = mongo.db.members

    def get(self, mid=None, cid=None):
        print(mid)
        print(cookie)
        if mid:
            # result = col_members.find().count()
            result = self.col_members.find_one({'_id': mid})
            if result:
                # return jsonify({'result': result})
                return {'result': result}
            else:
                return {'response': "mid missing"}
        else:
            data = {'response': "ERROR"}
            return data


class UserRecommendTopics(Resource):
    # TODO find topic list from neighbour
    def get(self, mid=None, cid=None):
        uid = mid or cid
        return {'data': uid}


#=== Rounting ===#
api = Api(app)
# cursor.skip()
# cursor.limit()

#=== Behavior ===#
# Stats
api.add_resource(
    UserBehaviorStats,
    "/api/behavior/stats/<int:mid>",
    "/api/behavior/stats/<string:cid>",
    endpoint="behavioral_stats"
)
# Rooms
api.add_resource(
    UserBehaviorRooms,
    "/api/behavior/rooms/<int:mid>",
    "/api/behavior/rooms/<string:cookie>",
    endpoint="behavioral_rooms"
)
# Tags
api.add_resource(
    UserBehaviorTags,
    "/api/behavior/tags/<int:mid>",
    "/api/behavior/tags/<string:cookie>",
    endpoint="behavioral_tags"
)
# Following
api.add_resource(
    UserBehaviorFollowing,
    "/api/behavior/following/<int:mid>",
    "/api/behavior/following/<string:cookie>",
    endpoint='behavioral_following'
)

#=== Recommend ===#
# Topics
api.add_resource(
    UserRecommendTopics,
    "/api/recommend/topics/<int:mid>",
    "/api/recommend/topics/<string:cookie>",
    endpoint='recommend_topics'
)

# Neighbours
api.add_resource(
    UserRecommendNeighbours,
    "/api/recommend/neighbours/<int:mid>",
    "/api/recommend/neighbours/<string:cookie>",
    endpoint='recommend_neighbours'
)

# top@member
api.add_resource(
    TopMember,
    "/api/top/member/",
    endpoint="top_member"
)

if __name__ == "__main__":
    app.run(
        host=APP_CONFIG['host'],
        port=APP_CONFIG['port'],
        threaded=APP_CONFIG['threaded'],
        debug=APP_CONFIG['debug']
    )
