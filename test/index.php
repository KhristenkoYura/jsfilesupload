<?
header('Content-Type: text/html; charset=utf-8');
?>
<html>
    <head>
        <title>Files Upload</title>
        <link rel="stylesheet" href="jquery/jquery-ui/css/redmond/jquery-ui-1.8.custom.css" type="text/css" />
        <script src="jquery/jquery-1.4.2.min.js"></script>
        <script src="jquery/jquery-ui/js/jquery-ui-1.8.custom.min.js"></script>
        <script src="fsu.js"></script>
        <script src="toolbar.js"></script>
    <script>
        $(document).ready(function(){
            var upload = new uploaderFiles({
                'thread':4,
                handlers:{
                    'onUploadFileFinish':function(obj,file,e,res){
                    },
                    'onFinish':function(obj){
                        //console.log(obj);
                    },
                    'onUploadFileStart':function(obj,file,e){
                        obj.setParamsE(e,{
                            'get':{
                                'rand':function(){
                                    return Math.random();
                                },
                                'id':file.id
                            }
                        });
                    }
                },
                'plugins':{
                    'Toolbar':{},
                    'Progress':{'sendTo':'test.html'}
                }
            });
            upload.setE(document.getElementById("files"),{
                'sendTo':'req.php',
                'post': {'post':'true',
                        'post2':'true2',
                        'name':function(obj,e,file,t){
                            return file.file.fileName;
                        }},
                'get': {'get':'true','get2':'true2'}
            });
            upload.setE(document.getElementById("files2"),{
                'sendTo':'req.php?ggg',
                'post': {'post':'true',
                        'post2':'true2',
                        'name':function(obj,e,file,t){
                            return file.file.fileName;
                        }},
                'get': {'name':'Yura','secondName':'Khristenko'}
            });
        });
    </script>
    </head>
    <body>
        <form id="form" method="post" enctype="multipart/form-data">
        <input type="file" name="files" id="files" /><br/><br/><br/>
        <input type="file" name="files2" id="files2" />
        </form>
    </body>
</html>