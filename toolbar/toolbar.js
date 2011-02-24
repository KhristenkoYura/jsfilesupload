/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
//Toolbar
(function($)
{
    document.uploaderPluginToolbar = {
        o:{},
        fC:0,
        fT:0,
        fF:0,
        fileRead:[],
        startFile:false,
        time:1000,
        params:{},
        defaultParams:{
            prefix:'uploaderPluginToolbar',
            'style':{},
            'element':'body',
            'size':80,
            'icon':['jpeg','jpg','gif','png'],
            'iconPath':'icon/'
        },
        onInit:function(){
            var p = this.params.prefix,
                obj = this.o,
                self=this;
            $("head").prepend(this.getStyle(p));
            $(this.params.element).prepend(this.getHtml(p));
            $('#'+p).tabs();
            $('.'+p+'Button').button();
            $('.'+p+'Button.'+p+'Delete').click(function(){
                $(this).parents('.'+p+'Tab').find('li.'+p+'File:not(:animated)').find('input:checked').each(function(){
                    var id = $(this).attr('value');
                    obj.deleteFile(id);
                    $('#'+p+'CountFileId'+id).fadeOut(1000,function(){
                        var id = $(this).parents('.'+p+'Tab').attr('id');
                        var index = parseInt(id.charAt(id.length-1));
                        switch(index){
                            case 1:
                                $('#'+p+'HCountFiles').html(--self.fC);
                            break;
                            case 2:
                                $('#'+p+'HCountFalseFiles').html(--self.fF);
                            break;
                            case 3:
                                $('#'+p+'HCountTrueFiles').html(--self.fT);
                            break;
                        }
                        $(this).remove();
                    });
                });
                return false;
            });
            $('.'+p+'Button.'+p+'Abort').click(function(){
                $(this).parents('.'+p+'Tab').find('li.'+p+'File:not(:animated)').find('input:checked').each(function(){
                    var id = $(this).attr('value');
                    
                    if(typeof(obj.t[id])!='undefined'){
                        obj.t[id].abort();
                    }
                });
                return false;
            });

            $('.'+p+'Button.'+p+'Add').click(function(){
                var id=[],
                    i=0,
                    j=0,
                    li =
                $(this).parents('.'+p+'Tab').find('li.'+p+'File:not(:animated)').find('input:checked');
                for(;i<li.length;i++){
                    id.push(li.get(i).value);
                }

                for(i=0;i<id.length;i++){
                    $(this).parents('.'+p+'Tab').find('#'+p+'CountFileId'+id[i]).remove();
                    $('#'+p+'HCountFalseFiles').html(--self.fF);
                    for(j=0;j<obj.notFiles.length;j++){
                        if(obj.notFiles[j].id==id[i]){
                            file = obj.notFiles.splice(j,1)[0];
                            obj.setUploadFile(file,obj.getE(file.idE));
                            break;
                        }
                    }
                }
                return false;
            });

            $('.'+p+'Button.'+p+'Upload').click(function(){
                obj.uploadStart();
                return false;
            });

            $('.'+p+'Check').change(function(){
                $(this).parent().parent().find('ul li input:checkbox').attr('checked',$(this).attr('checked'));
            });

            $('#'+p+'ShowTabs').click(function(){
                $('#'+p+'AllTab').slideToggle(self.params.time);
                return false;
            });

        },
        onStart:function(){
            $('#'+this.params.prefix).show();
        },
        onSetFile:function(obj,file,e){
            $('#'+this.params.prefix+'HCountFiles').html(++this.fC);
            $('#'+this.params.prefix+'CountFile').append(
            '<li class="'+this.params.prefix+'File ui-state-default" id="'+this.params.prefix+'CountFileId'+file.id+'">'
                +'<ul>'
                    +'<li><input type="checkbox" value="'+file.id+'"></li>'
                    +'<li><img src="'+this.getIcon(file)+'" style="height:'+this.params.size+'px;display:block;" id="'+this.params.prefix+'Image'+file.id+'"/></li>'
                    +'<li><div style="height:20px;" class="'+this.params.prefix+'Progress"></div><div class="'+this.params.prefix+'ProgressText">ожидание</div></li>'
                    +'<li>'+this.getName(file)+'</li>'
                    +'<li>'+this.getSize(file)+'</li>'
                +'</ul>'
            +'</li>'
            );

            this.readImage(file);
            $('#'+this.params.prefix+'CountFileId'+file.id+' .'+this.params.prefix+'Progress').progressbar({});

        },
        onUploadFileStart: function(obj,file,e){
            $('#'+this.params.prefix+'CountFileId'+file.id+' .'+this.params.prefix+'ProgressText')
            .text('загрузка');
        },
        onUploadFileFinish:function(obj,file,e){
            this.fC--;
            $('#'+this.params.prefix+'HCountTrueFiles').html(++this.fT);
            $('#'+this.params.prefix+'HCountFiles').html(this.fC);

            var idUl,idLi;
            idUl='#'+this.params.prefix+'CountTrueFile';
            idLi='#'+this.params.prefix+'CountFileId'+file.id;

            $(idLi+' .'+this.params.prefix+'Progress').progressbar('value',100);
            $(idLi+' .'+this.params.prefix+'ProgressText')
            .text('загружено');

            $(idLi).fadeOut(1000,function(){
                $(idUl).append(this);
                $(this).fadeIn(1000);
            });
        },
        onUploadFileError:function(obj,file,e){
            this.fC--;
            $('#'+this.params.prefix+'HCountFalseFiles').html(++this.fF);
            $('#'+this.params.prefix+'HCountFiles').html(this.fC);

            var idUl,idLi;
            idUl='#'+this.params.prefix+'CountFalseFile';
            idLi='#'+this.params.prefix+'CountFileId'+file.id;

            $(idLi+' .'+this.params.prefix+'Progress').progressbar('value',0);
            $(idLi+' .'+this.params.prefix+'ProgressText')
            .text('ошибка');

            $(idLi).fadeOut(1000,function(){
                $(idUl).append(this);
                $(this).fadeIn(1000);
            });

        },
        onUploadFileProgress: function(total,loaded,obj,file,e){
            var proc = Math.round(loaded * 100 / total);
            var idLi;
            idLi='#'+this.params.prefix+'CountFileId'+file.id;
            $(idLi+' .'+this.params.prefix+'Progress').progressbar('value',proc);
            $(idLi+' .'+this.params.prefix+'ProgressText')
            .text('загрузка '+proc+'%');
        },
        getHtml:function(prefix){
            return '<div id="'+prefix+'" style="display:none">'
                    +'<ul>'
                        +' <li><a href="#'+prefix+'Tab1">Файлы в задании: <span id="'+prefix+'HCountFiles">0</span></a></li>'
                        +' <li><a href="#'+prefix+'Tab2">Не загруженные файлы: <span id="'+prefix+'HCountFalseFiles">0</span></a></li>'
                        +' <li><a href="#'+prefix+'Tab3">Загружено файлов: <span id="'+prefix+'HCountTrueFiles">0</span></a></li>'
                    +'</ul>'
                    +'<div align="right">'
                        +'<a href="#" id="'+prefix+'ShowTabs">Свернуть/Развернуть</a>'
                    +'</div>'
                    +'<div style="display:none;" id="'+prefix+'AllTab" >'
                        +'<div id="'+prefix+'Tab1" class="'+prefix+'Tab">'
                            +'<div><input type="checkbox" id="'+prefix+'CountAll" class="'+prefix+'Check">Выбрать все'
                                +'<div style="float:right;">'
                                    +'<a href="#" class="'+prefix+'Upload '+prefix+'Button">Загрузить</a>&nbsp;'
                                    +'<a href="#" class="'+prefix+'Abort '+prefix+'Button">Перезагрузить</a>&nbsp;'
                                    +'<a href="#" class="'+prefix+'Delete '+prefix+'Button">Удалить</a>'
                                +'</div>'
                            +'</div>'
                            +'<ul id="'+prefix+'CountFile" class="ui-sortable"></ul>'
                        +'</div>'
                        +'<div id="'+prefix+'Tab2" class="'+prefix+'Tab">'
                            +'<div><input type="checkbox" id="'+prefix+'CountFalse" class="'+prefix+'Check">Выбрать все'
                                +'<div style="float:right;">'

                                    +'<a href="#" class="'+prefix+'Add '+prefix+'Button">В задание</a>&nbsp;'
                                    +'<a href="#" class="'+prefix+'Delete '+prefix+'Button">Удалить</a>'
                                +'</div>'
                            +'</div>'
                            +'<ul id="'+prefix+'CountFalseFile" class="ui-sortable"></ul>'
                        +'</div>'
                        +'<div id="'+prefix+'Tab3" class="'+prefix+'Tab">'
                            +'<div><input type="checkbox" id="'+prefix+'CountTrue" class="'+prefix+'Check" >Выбрать все'
                                +'<div style="float:right;">'
                                    +'<a href="#" class="'+prefix+'Delete '+prefix+'Button">Удалить</a>'
                                +'</div>'
                            +'</div>'
                            +'<ul id="'+prefix+'CountTrueFile" class="ui-sortable"></ul>'
                        +'</div>'
                    +'</div>'
                +'</div>';
        },
        getStyle: function(prefix){
            return '<style>'
            +'.'+prefix+'File {clear:both;list-style-type:none;white-space:nowrap;margin: 5px auto;line-height:'+this.params.size+'px;}'
            +'.'+prefix+'File ul{display: table-cell; vertical-align: middle; list-style-type:none;padding:0;margin:0;}'
            +'.'+prefix+'File li{display: table-cell; vertical-align: middle; padding: 0px 5px; white-space:nowrap;margin-right:5px;line-height:'+this.params.size+'px;displa}'
            +'#'+prefix+'CountFile{padding:0;}'
            +'.'+prefix+'Progress{width:200px;height:10px;font-size:10px;}'
            +'.'+prefix+'ProgressText{font-size:12px;left: 0px; line-height: 0; position: relative; top: -12px; padding-left: 55px;}'
            +'.ui-sortable{padding:0;}'
            +''
            +'</style>';
        },
        readImage:function(file){
            if(file.type=='file')
                if(/image.*/.test(file.file.type)){
                    this.fileRead.push(file);
                    this.startFileRead();
                }
        },
        startFileRead:function(){
            if(this.startFile)
                return;
            var obj = this;
            (function(){
                var fun=arguments;
                if(obj.fileRead.length==0){
                    obj.startFile=false;
                    return true;
                }

                if(obj.startFile==false){
                    obj.startFile=true;
                }
                
                var file = obj.fileRead.shift();
                var reader = new FileReader();
                reader.onload=function(evn){
                    var id='#'+obj.params.prefix+'Image'+file.id,image = new Image();
                    image.onload=function(evt){
                        var h='',w='',size=obj.params.size;;
                        if(evt.target.width > evt.target.height)
                            w=size;
                        else
                            h=size;
                        $(id).attr('src',evt.target.src);
                        $(id).css('height',h);
                        $(id).css('width',w);
                        $(id).parent()
                            .css('width',size+'px')
                            .css('height',size+'px');
                        delete image;
                        setTimeout(fun.callee,1);
                    }
                    image.src = evn.target.result;
                }
                reader.readAsDataURL(file.file);
            })();

        },
        getIcon:function(file){
            var req,
                icon=this.params.icon,
                name=this.getName(file);
            for(var i=0;i<icon.length;i++){
                req = new RegExp('\.'+icon[i]+'$','i');
                if(req.test(name)){
                    return this.params.iconPath+icon[i]+'.png';
                }
            }
            return this.params.iconPath+'default.png';
        },
        getName:function(file){
            if(file.type!='file'){
                return /([^\\\/]+)$/.exec(file.file.value)[0];
            }
            return file.file.fileName;
        },
        getSize:function(file){
            if(file.type=='file'){
                var s =['б.','Кб.','Мб.','Гб.'],d=Math.floor(Math.log(file.file.fileSize)/Math.log(1024));
                return Math.round(file.file.fileSize/(Math.pow(1024,d)))+' '+s[d];
            }
            return '&nbsp;'

        },
        setParams:function(params){
            this.params = this.o.extendParams(this.defaultParams, params);
        }
};
    document.uploaderPluginToolbarMini = {
        o:{},
        params:{},
        defaultParams:{
            'prefix':'uploaderPluginToolbarMini',
            'icon':'icon.png'
        },
        onSetElement:function(obj,e){
            var p = this.params;
            $(e.e).after(
                '<span id="'+p.prefix+'Img'+e.id+'" style="visibility:hidden;"><img src="'+p.icon+'"></span>'+
                '<span id="'+p.prefix+'Text'+e.id+'"></span>'+
                '<span id="'+p.prefix+'Proc'+e.id+'"></span>');
        },
        onUploadFileStart:function(obj,file,e){
            var p = this.params;
            $('#'+p.prefix+'Img'+e.id+'').css('visibility','visible');
            $('#'+p.prefix+'Text'+e.id+'').text('Загрузка');
        },
        onUploadFileProgress: function(total,loaded,obj,file,e){
            $('#'+this.params.prefix+'Proc'+e.id+'').text(Math.round(loaded * 100 / total)+'%');
        },
        onOpen:function(obj,e){
            var key;
            for(key in obj.files){
                if(obj.files[key].idE==e.id)
                    return obj.deleteFile(obj.files[key].id);
            }

            for(key in obj.t){
                if(obj.t[key].file.idE == e.id)
                    return obj.deleteFile(obj.t[key].file.id);
            }
        },
        onUploadFileFinish:function(obj,file,e){
            var p = this.params;
            $('#'+p.prefix+'Img'+e.id+'').css('visibility','hidden');
            $('#'+p.prefix+'Text'+e.id+'').text('');
            $('#'+p.prefix+'Proc'+e.id+'').text('');
        },
        setParams:function(params){
            this.params = this.o.extendParams(this.defaultParams, params);
        }
    };
})(jQuery);

document.uploaderPluginProgress = {
        o:{},
        pid:{},
        params:{},
        defaultParams:{
            sendTo:'/progress',
            varName:'X-Progress-ID',
            varType:'get',
            method:'get',
            time:1000,
            callback:function(result){
                return result.split('|');
            }
        },
        onUploadFileStart:function(o,file,e){
            var id = this.getRandomString(),
                obj = this,
                method;
            this.pid[id]=file;
            e.params[this.params.varType][this.params.varName]=id;
            switch(this.params.method){
                case 'post':
                case 'header':
                method='POST';
                    break;
                case 'get':
                   default:
                method='GET';
            }
            window.setTimeout(function(){obj.upload.call(obj,id,method)},this.params.time);
        },
        onUploadFileFinish:function(obj,file,e){
            this.pid[e.params[this.params.varType][this.params.varName]]=false;
        },
        onUploadFileAbort:function(obj,file,e){
            this.onUploadFileFinish(obj,file,e);
        },
        upload:function(id,method){
            var obj = this,
                xhr = this.getXhr(),
                url = this.params.sendTo,
                data=null;

            if(!this.pid[id])
                return false;

            switch(this.params.method){
                case 'post':
                data=this.params.varName+'='+id;
                    break;
                case 'header':
                //xhr.setRequestHeader(this.params.varName,id);
                    break;
                case 'get':
                   default:
                url+=((/\?+/.test(url)) ? '&':'?')+this.params.varName+'='+id;
                    break;
            }

            xhr.open(method,url,true);
            xhr.onreadystatechange = function(){
                if(xhr.readyState == 4 && xhr.status==200){
                    var res = obj.params.callback(xhr.responseText);
                    
                    if(res===false || !obj.pid[id])
                        return obj.pid[id]=false;
                    
                    if(res!=null){
                        obj.o.trigger('onUploadFileProgress',res[0],res[1],obj.o,obj.pid[id],obj.o.getE(obj.pid[id].idE));
                        //console.log(obj.o,obj.pid[id],obj.o.getE(obj.pid[id].idE));
                    }
                    
                    window.setTimeout(function(){obj.upload.call(obj,id,method)},obj.params.time);
                }
            };
            xhr.send(data);
        },
        getXhr:function(){
          var xmlhttp;
          try {
            xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
          } catch (e) {
            try {
              xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (E) {
              xmlhttp = false;
            }
          }
          if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
            xmlhttp = new XMLHttpRequest();
          }
          return xmlhttp;
        },
        getRandomString:function(){
             var id = "";
             for (i = 0; i < 32; i++) {
              id += Math.floor(Math.random() * 16).toString(16);
             }
             return id;
        },
        setParams:function(params){
            this.params = this.o.extendParams(this.defaultParams, params);
        }
};