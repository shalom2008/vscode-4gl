var oracledb = require('oracledb');
 
var query = function(sql,callback){
    oracledb.getConnection(
        {
            user          : "tjnm",
            password      : "tjnm",
            connectString : "192.168.10.221:1521/topprod"
        },
        function (err, connection)
        {
            if (err)
            {
                console.error(err.message);
                return;
            }
            connection.execute(sql, [], function (err, result)
            {
                if (err)
                {
                    console.error(err.message);
                    doRelease(connection);
                    return;
                }
                callback(result.rows.map((v)=>
                    {
                        return result.metaData.reduce((p, key, i)=>
                        {
                            p[key.name] = v[i];
                            return p;
                        }, {})
                    }));
                doRelease(connection);
            });
        }
    );
}
 
function doRelease(connection) {
    connection.close(
        function(err) {
            if (err)
                console.error(err.message);
        });
}
 
exports.query = query;