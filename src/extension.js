// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const db = require('./db');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

    var sql = ""
    var show_mes = new Map();

function activate(context){
    console.log("Congratulations, your extension 'vscode-4gl' is now active!");

    vscode.languages.registerHoverProvider('4GL',{
        provideHover
    });
}

function provideHover(document, position, token){
    const word = document.getText(document.getWordRangeAtPosition(position));
    const line = document.lineAt(position).text;

    if (word){
        console.log(line);
        if (show_mes.get(word) == undefined){
            if (/^\s*ON\s*ACTION.*/.test(line) || /^\s*WHEN.*/.test(line)){
                var result_list = [];
                sql = "select distinct gbd04 from gbd_file where gbd03='2' and gbd01='" + word + "'";
                db.query(sql, function(a){
                    for (var i=0;i<a.length;i++){
                        result_list.push(a[i].GBD04);
                    }
                    var field_value = result_list.join(";")
                    show_mes.set(word, field_value);
                })
            }
            else{
                if (/^\s*.*\scl_err.*/.test(line)){
                    var result_list = [];
                    sql = "select distinct ze03 from ze_file where ze02='2' and ze01='" + word + "'";
                    db.query(sql, function(a){
                        for (var i=0;i<a.length;i++){
                            result_list.push(a[i].ZE03);
                        }
                        var field_value = result_list.join(";")
                        show_mes.set(word, field_value);
                    })
                }
                else{
                    var result_list = [];
                    upper_word = word.toUpperCase();
                    sql = "select distinct gae04 from gae_file where gae03='2' and gae02='" + word + "' " +
                                "union select data_type||'('||data_length||')' from dba_tab_columns where" +
                                " column_name = '" + upper_word + "' and OWNER='DS'";
                    db.query(sql, function(a){
                        for (var i=0;i<a.length;i++){
                            result_list.push(a[i].GAE04);
                        }
                        var field_value = result_list.join(";")
                        show_mes.set(word, field_value);
                    })
                }
            }
        }else{
            return new vscode.Hover(show_mes.get(word));
        }
    }    
}

module.exports = {
    activate
}