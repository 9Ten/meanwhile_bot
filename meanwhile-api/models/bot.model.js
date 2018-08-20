class Bot {
  static getCreditWithAcc (user_id,sa_id,callback) {
      connection.query('SELECT * FROM kbtg_dataset.sa_transaction st join ip_sa_mapper ism on st.sa_id = ism.sa_id where st.sa_id = ' + connection.escape(sa_id) + ' ism.u_id = ' + connection.escape(user_id) + ' order by txn_dt DESC ,txn_tm DESC limit 1', function (error, results, fields) {
        var result = JSON.parse(JSON.stringify(results));
        if (error) 
            callback(error,null);
        else
            callback(null,result);
    });
  }
}

module.exports = Bot
