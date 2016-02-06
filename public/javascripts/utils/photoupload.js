define(['../../../resources/javascript/jquery.form.js',
    '../../../resources/style/jcrop/js/jquery.Jcrop.js'
],function (jq,jqueryform,Jcrop) {
    var bindings = [
    ];
    function init(cfg) {
        cfg.action=cfg.action||"../../Media/UploadPhoto";
        cfg.ratio=cfg.ratio||1/1;
        cfg.category=cfg.category||"";
        $("#category").val(cfg.category);
        //todo 初始化上传图片
        function showCoords(c) {
            //jcrop_API.getScaleFactor()
//            jcrop_API.tellSelect()
            $("#p1").text(c.x + "   " + c.y + "   " + c.w + "   " + c.h );
            $("#x1").val(c.x*ratio);
            $("#y1").val(c.y*ratio);
            $("#x2").val(c.x2*ratio);
            $("#y2").val(c.y2*ratio);
            $("#cw").val(c.w*ratio);
            $("#ch").val(c.h*ratio);
        }
        $(function () {
            var bar = $('.bar');
            var percent = $('.percent');
            var showimg = $('#showimg');
            var progress = $(".progress");
            var files = $(".files");
            var btn = $(".btn span img");
            //$(".demo").wrap("<form id='formUpload' action='/institutionuploadphoto?id="+params.id+"' method='post' enctype='multipart/form-data'></form>");
            $(".item-photo").wrap("<form id='tmpformUpload'  method='post' enctype='multipart/form-data'></form>");
            $("#photoupload").change(function(){
                //View.saveInstitution(function(_params) {
                r365App.showIndicator();
                //$$("#formUpload").attr("action", "/institutionuploadphoto?id=" + _params.item.id);
                $$("#tmpformUpload").attr("action", "/Media/loadTmpPhoto");
                $("#tmpformUpload").ajaxSubmit({
                    beforeSend: function () {
                    },
                    uploadProgress: function (event, position, total, percentComplete) {
                        var percentVal = percentComplete + '%';
                        bar.width(percentVal)
                        percent.html(percentVal);
                    },
                    success: function (data) {

                        r365App.hideIndicator();
                        var retObj = JSON.parse(data);
                        if(!retObj.success)
                        {
                            r365App.alert("上传文件失败！")
                            return;
                        }
                        var _tmpUrl="../../resources/image/upload/"+retObj.data.filename;
                        $("#filename").val(retObj.data.filename);
                        $("#tmpImg").attr("src", _tmpUrl).load(function() {
//                                $(this).hide();
                            imgWidth =Math.round(this.width);
                            imgHeight = Math.round(this.height);
                            $(this).css("width","100%");
                            $(this).css("height","100%");
                            afterWidth = Math.round(this.width);
                            afterHeight = Math.round(this.height);
                            ratio=imgWidth/afterWidth;
//                                $(this).show();
                            $(this).unbind("load");
                        });
                        //$("#tmpImg").css("width",($(window).width()).toString()+"px");
//                            $("#tmpImg").css("width","100%");
//                            $("#tmpImg").css("height","100%");
                        $(".jcrop-holder img").each(function(){
                            $(this).attr("src",_tmpUrl);
                        });
//                        $("#img1").css("visibility", "");
//                        $("#img1").show();


                        $("#jcrop-holder").remove();

                        $("#tmpImg").Jcrop({
                            bgColor: 'black',
                            bgOpacity: .4,
                            setSelect: [100, 100, 200,200],  //设定4个角的初始位置
                            aspectRatio: cfg.ratio,
                            onChange: showCoords,   //当裁剪框变动时执行的函数
                            onSelect: showCoords   //当选择完成时执行的函数
                        },function(){
                            jcrop_API=this;
                        });

                        //弹出编辑框
                        r365App.popup(".popup");
                        $("#linkSubmit").click(function(){
                            r365App.showIndicator();

                            $("#formUpload").ajaxSubmit({
                                success: function(data) {
                                    $("#linkSubmit").unbind("click");
                                    $("#tmpImg").css("width","");
                                    $("#tmpImg").css("height","");
//                                        $("#tmpImg").unbind("load");
                                    var retObj=JSON.parse(data);
                                    if(retObj.success) {
                                        jcrop_API.destroy();
                                        $("input[name='photo_id']").val(retObj.data[0].photoid);
                                        $("#imgPhoto").attr("src",retObj.data[0].thu_url);
                                    }
                                    else
                                    {
                                        r365App.alert("图片保存失败。");
                                    }
                                    r365App.hideIndicator();
                                },
                                error:function(xhr){
                                    r365App.hideIndicator();
                                    //alert("图片保存失败！");
                                }
                            });
                        });
                    },
                    error: function (xhr) {
                        r365App.hideIndicator();
                        r365App.alert("上传失败！");
                    }
                });
                //});

            });
        });
        //todo 初始化上传图片 end
    }

    function ___init(cfg) {
        cfg.action=cfg.action||"../../Media/UploadPhoto";
        //todo 初始化上传图片
        $(function () {
        var imgPhoto = $("#imgPhoto");
        $(".item-photo").wrap("<form id='photouploadform' method='post' enctype='multipart/form-data'></form>");
        $("#photoupload").change(function(){
            r365App.showIndicator();
            $$("#photouploadform").attr("action", cfg.action);
            $("#photouploadform").ajaxSubmit({
                success: function (data) {
                    var retObj = JSON.parse(data);
                    if (retObj.data.length > 0) {
                        var imgObj = retObj.data[0];
                        imgPhoto.attr("src", imgObj.thu_url);
                        if(cfg.next){
                            cfg.next(imgObj);
                        }
                    }
                    r365App.hideIndicator();
                },
                error: function (xhr) {

                    r365App.hideIndicator();
                    r365App.alert("上传失败！");
                }
            });

        });
        });

    }
    return {
        init: init
    };
});