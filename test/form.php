<html>
    <head>
        <title>Files Upload</title>
        
    </head>
    <body>
        <pre>
<?
print_r($_SERVER);
?>
        </pre>
    <form method="POST" enctype="multipart/form-data">
    	<input name="user">
    	<input name="email">
        <input type="file" name="files" id="files" />
        <input type="submit" value="���������">
        </form>
    </body>

</html>
