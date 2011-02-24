(function($)
{
    document.ajaxUploadFilesjQuery =
    {
        bind:function(e,name,fn){
            $(e).bind(name,fn);
        }
    };
    
})(jQuery);

function uploaderFiles(params)
{
    /**
     * Get last id
     * @return int
     */
    this.getLastId = function(id){
        return this.lastId[id]++;
    };

    this.extendParams = function(def,o){
        var on={};
        for(key in def){
            on[key] = (typeof(o[key])=="undefined") ? def[key]:o[key];
        }
        return on;
    };

    this.extendObj = function(def,o){
        for(key in def){
            if(typeof(o[key])=="undefined")
                o[key]=def[key];
        }
        return o;
    };

    this.uploadStart = function(){
        if(this.isUpload){
            if(this.files.length!=0 && !this.isUploader)
                this.uploadFiles();
            return false;
        }
        this.isUpload=true;
        this.trigger('onStart',this,this.files);
        this.uploadFiles();
    };

    this.uploadFinish = function(){
        if(this.files.length!=0 || this.thread!=0)
            return false;
        this.isUpload=false;
        this.trigger('onFinish',this,this.notFiles);
    };

    this.setUploadFile=function(file,e){
        if(typeof(file.file)=="undefined"){
            file = {
                'id':this.getLastId('id'),
                'idE':e.id,
                'file':file,
                'abort':0,
                'type':((typeof(file.fileName)!="undefined") ? 'file':'element')};
        }
        this.files.push(file);
        this.trigger('onSetFile',this,file,e);
    };

    this.uploadFiles = function()
    {
        this.isUploader=true;
        if(this.files.length==0){
            this.isUploader=false;
            return true;
        }

        if(this.thread < this.params.thread){
            this.thread++;
            var file = this.files.shift();
            this.t[file.id]=this.getTransport(file);
            this.t[file.id].start();
            return this.uploadFiles();
        }
        else
            setTimeout(function(){obj.uploadFiles.call(obj)},200);
    };

    this.getTransport = function(file){
        var t,
            name = (file.type=='file') ? 'xmlHttpRequest': 'iframe';
        t = this.extendObj(this.transportAbstract,new this.transport[name]());
        t.setFile(file);
        t.setE(this.getE(file.idE));
        return t;
    };
    this.transportAbstract = {
        t:{},
        file:{},
        e:{},
        setFile:function(file){
            this.file=file;

        },
        setE:function(e){
            this.e=e;
        },
        getFileName:function(){

            return (typeof(this.e.e.name)=="undefined")?'file':this.e.e.name;
        },
        getParam:function(p){
            if(typeof(p)=='function')
                return p(obj,this.e,this.file,this);
            return p;
        },
        getUrl:function(){
            var url=this.e.params.sendTo,
                query=[];
            for(key in this.e.params.get){
                query.push(key+'='+this.getParam(this.e.params.get[key]));
            }
            return url+=((/\?+/.test(url)) ? '&':'?')+query.join('&');
        },
        abort:function(){
            var file = this.file;
            if(file.abort < obj.params.abort){
                file.abort++;
                obj.trigger('onUploadFileAbort',obj,file,this.e);
                this.deleteT();
                this.start();
            }else{
                this.deleteT();
                obj.thread--;
                file.abort=0;
                obj.notFiles.push(file);
                obj.trigger('onUploadFileError',obj,file,this.e);
                obj.uploadFinish();
                delete obj.t[this.file.id];
            }
        },
        start:function(){
            this.createT();
            obj.trigger('onUploadFileStart',obj,this.file,this.e);
            this.upload();
        },
        onload:function(res){
            obj.thread--;
            obj.trigger('onUploadFileFinish',obj,this.file,this.e,res);
            obj.uploadFinish();
            this.deleteT();
            delete obj.t[this.file.id];
        }
    };

    this.transport={
        'xmlHttpRequest':function(){
            this.createT = function(){
                this.t = new XMLHttpRequest();
            };
            this.deleteT = function(){
                this.t.onreadystatechange=function(){};
                this.t.abort();
                this.t={};
            };
            this.upload=function(){
                var t = this,
                    req = this.t,
                    url = this.getUrl();
                req.open('POST', url, true);
                req.setRequestHeader("X-Requested-With", "XMLHttpRequest");

                req.onreadystatechange=function(){
                    if(req.readyState==4){
                        var responseText = req.responseText,
                            status = req.status;
                        if(status==200){
                            t.onload(responseText);
                        }else{
                            t.abort();
                        }
                    }
                };

                if(obj.params.progress){
                    req.upload.onprogress = function(event){
                        obj.trigger('onUploadFileProgress',event.total,event.loaded,obj,t.file,t.e);
                    };
                }
                if(typeof(FormData) == 'function')
                    this.sendFormData();
                else
                    this.sendHeadersData();
            };
            this.sendFormData = function(){
                var data = new FormData();
                for(key in this.e.params.post){
                    data.append(key,this.getParam(this.e.params.post[key]));
                }
                data.append(this.getFileName(),this.file.file);
                this.t.send(data);
            };
            this.sendHeadersData = function(){
                var reader = new FileReader(),
                    file = this.file,
                    req=this.t,
                    t=this;

                reader.onerror = function(){
                    reader='';
                    t.abort();
                };
                reader.onload = function(event){
                    var boundary,headers,boundaryString,n;
                    n="\r\n";
                    boundaryString = "--ajaxuploadfiles";
                    boundary = "--"+boundaryString;
                    headers="";
                    headers += boundary+n;
                    for(key in t.e.params.post){
                        headers+='Content-Disposition: form-data; name="'+key+'"'+n+n;
                        headers+= encodeURIComponent(t.getParam(t.e.params.post[key]))+n;
                        headers+=boundary+n;
                    }

                    headers += 'Content-Disposition: form-data; name="'+t.getFileName()+'"; filename="'+encodeURIComponent(file.file.fileName)+'"'+n;
                    headers += 'Content-Type: '+file.file.type+n+n;
                    headers += event.target.result+n;
                    headers += boundary;
                    headers += "--"+n;
                    req.setRequestHeader("Content-Type", "multipart/form-data; boundary="+boundaryString);
                    req.sendAsBinary(headers);
                    reader = headers='';
                };
                reader.readAsBinaryString(file.file);
            };
        },
        'iframe':function(){
            this.start = function(){
                this.idFrame = "uploadFileIFrame"+this.file.id;
                this.idForm = "uploadFileForm"+this.file.id;
                this.idDiv ="uploadFileDiv"+this.file.id;
                this.createT();
                this.upload();
            };
            this.createT = function(){
                var html='<iframe name="'+this.idFrame+'" id="'+this.idFrame+'"></iframe>'
                    +'<form action="'+this.getUrl()+'" id="'+this.idForm+'" target="'+this.idFrame+'" enctype="multipart/form-data" method="POST" style="display:none"></form>';
                div = document.createElement("div");
                div.id=this.idDiv;
                div.style.display="none";
                div.innerHTML=html;
                document.body.appendChild(div);
            };

            this.upload = function(){
                var t=this;
                var input='',
                    form = t.getId(this.idForm),
                    iframe = t.getId(this.idFrame);
                    
                for(key in t.e.params.post){
                    input+='<input name="'+key+'" value="'+this.getParam(t.e.params.post[key])+'" />';
                }
                form.innerHTML=input;
                // Append file
                form.appendChild(t.file.file.cloneNode(true));
                form.submit();

                (function(){
                    var iframe = t.getId(t.idFrame);
                    var div = t.getId(t.idDiv);
                    if(div.length==0)
                        return;
                    if (!(iframe.contentWindow || iframe.contentDocument || iframe.document)){
                         setTimeout(arguments.callee,100);
                         return;
                    }
                    iframe.isLoad=false;
                    iframe.onload = function(evn){
                        iframe.isLoad=true;
                        t.onload(iframe.contentWindow.document.body.innerHTML);
                    };
                    setTimeout(function(){
                        if(!iframe.isLoad){
                            t.abort();
                        }
                    },10000);
                })();
            };

            this.deleteT = function(){
                var div = this.getId(this.idDiv),
                    iframe = this.getId(this.idFrame);
                iframe.parentNode.removeChild(iframe);
                div.parentNode.removeChild(div);
            };

            this.getId = function(id){
                return document.getElementById(id)
            }
        }
    };


    this.setHandler=function(name,fn){
        this.handlers[name] = this.extendObj(this.getDefaultHandlers, fn);
    };

    this.setE = function(e,params){
        var params = this.extendParams(this.getDefaultParamsForE,params);

        for(key in this.e){
            if(this.e[key].e == e){
                this.e[key].params = params;
                return;
            } 
        }

        // Set Params
        var index = this.getLastId('e');
        e.index = index;
        e.multiple = params.multiple;

        var ee = {
            'id':index,
            'e':e,
            'params':params
        };
        //Set obj
        this.e.push(ee);

        //Set Handlers
        this.bind(ee.e,'click',function(evn){
            obj.trigger('onOpen',obj,ee);
        });

        this.bind(ee.e,'change',function(){
            obj.trigger('onSelect',obj,ee);
        });

        this.trigger('onSetElement',this,ee);

        return true;
    };

    this.getE = function(id){
        for(key in this.e){
            if(typeof(id)=="number")
                if(this.e[key].id == id){
                    return this.e[key];
                }
            if(typeof(id)=="object"){
                
                if(this.e[key].e == id){
                    return this.e[key];
                }}
        }
    };
    
    this.trigger=function(){
        var args = Array.prototype.slice.call(arguments);
        var fn = args.shift();
        for(key in this.handlers){
            this.event(fn,this.handlers[key],args);
        }
    };

    this.event = function(fn,o,args){
        o[fn].apply(o,args);
    };

    this.setPlugin = function(name,params){
        if(typeof(this.handlers[name])!="undefined"){
            return this.handlers[name].setParams(params);
        }
        var key = 'uploaderPlugin'+name;
        this.handlers[name] = document[key];
        this.handlers[name].o=this;
        this.handlers[name].setParams(params);
        this.setHandler(name,this.handlers[name]);
        this.event('onInit',this.handlers[name],[obj]);
    };

    // Handlers
    this.onInit = function(){};
    this.onSelect = function(obj,e){
        if(e.params.auto){
            this.setFilesWithE(e);
            this.cleanE(e);
            this.uploadStart();
        }
    };

    this.setFilesWithE = function(e){
        if(typeof(e.e.files)!="undefined"){
            var files = e.e.files;
            for(var i=0;i<files.length;i++)
                this.setUploadFile(files[i],e);
        }else{
                //var file = /([^\/\\]+)$/i.exec(e.e.value)[0];
                this.setUploadFile(e.e.cloneNode(true),e);
        }
    };

    this.defFramework = function(){
        var name,
            f = ['Js','jQuery','Mootuls'],
            i=0;
            for(;i<f.length;i++){
                name = 'ajaxUploadFiles'+f[i];
                if(typeof(document[name])=='object')
                    return this.extendObj(document[name],this);
            }
    };

    this.cleanE=function(e){
        var form = document.createElement('form');
        e.e.parentNode.insertBefore(form, e.e);
        form.appendChild(e.e);
        form.reset();
        form.parentNode.insertBefore(e.e, form);
        form.parentNode.removeChild(form);
        //e.e.parant
    };

    this.deleteFile = function(id){
        var key;
       for(key in this.files){
           if(this.files[key].id==id){
               this.trigger('onDeleteFile',obj,this.files[key]);
               this.files.splice(key,1);
               return;
           }
       }

       if(typeof(this.t[id])!='undefined'){
           this.trigger('onDeleteFile',obj,this.t[id].file);
           this.t[id].deleteT();
           delete this.t[id];
           this.thread--;
           return;
       }

       for(key in this.notFiles){
           if(this.notFiles[key].id==id){
               this.trigger('onDeleteFile',obj,this.notFiles[key]);
               this.notFiles.splice(key,1);
               return;
           }
       }

    };

    this.setParams = function(params){
        this.params = this.extendParams(this.params, params);
    };

    this.setParamsE = function(e,params){
        e.params = this.extendParams(e.params, params);
    };

    //Conctruct
    this.getDefaultHandlers = {
        'onInit':function(){},
        'onOpen':function(){},
        'onSelect':function(){},
        'onRemove':function(){},
        'onStart':function(){},
        'onFinish':function(){},
        'onSetElement':function(){},
        'onUploadFileStart':function(){},
        'onUploadFileProgress':function(){},
        'onUploadFileFinish':function(){},
        'onUploadFileAbort':function(){},
        'onUploadFileError':function(){},
        'onSetFile':function(){},
        'onDeleteFile':function(){},
        'onSetNotUploadFile':function(){}
    };

    this.getDefaultParams = {
        'plugins':{},
        'handlers':{},
        'thread':4,
        'abort':4,
        'progress':true
    };

    this.getDefaultParamsForE = {
        'count':1000,
        'accept':'',
        'auto':true,
        'multiple':"multiple",
        'sendTo':'',
        'post': {},
        'get': {}
    };

    this.files = [];
    this.t={};
    this.notFiles = [];
    this.thread=0;
    this.e=[];
    this.lastId={id:0,e:0};
    this.params={};
    this.files = [];
    this.handlers ={};
    this.isUpload=false;
    this.isUploader=false;
    var obj = this;

    this.defFramework();
    this.params = this.extendParams(this.getDefaultParams, params);
    this.setHandler('default',this);
    this.setHandler('user',this.params.handlers);

    for(key in this.params.plugins){
        this.setPlugin(key,this.params.plugins[key]);
    }
    // On init
        
    this.event('onInit',this);    
}