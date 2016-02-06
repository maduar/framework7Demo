var selectControls = function () {
    function selectProvince(Ctl, val, next, selectedText) {
        $$.ajax({
            url: '/province/getActiveList',
            type: 'POST',
            success: function (data) {
                data = JSON.parse(data).data;
                var optsHTML = "";
                optsHTML += '<option value="" selected="selected">请选择</option>';
                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    //optsHTML+='<option value="'+item.province_id+'" '+((item.province_id==val)?'selected=selected':'')+'>'+item.province_name+'</option>';
                    if (val) {
                        optsHTML += '<option value="' + item.province_id + '" ' + ((item.province_id == val) ? 'selected=selected' : '') + '>' + item.province_name + '</option>';
                    }
                    else if (selectedText) {
                        optsHTML += '<option value="' + item.province_id + '" ' + ((item.province_name == selectedText) ? 'selected=selected' : '') + '>' + item.province_name + '</option>';
                    }
                    else {
                        optsHTML += '<option value="' + item.province_id + '" >' + item.province_name + '</option>';
                    }
                }
                Ctl.html(
                    optsHTML
                );
                if (val) {
                    //Ctl.val(val);
                    next({'value': val, 'text': Ctl.find("[selected='selected']").text()})
                } else {
                    next({'value': Ctl.val(), 'text': Ctl.find("[selected='selected']").text()})
                }
//                Ctl.bind("change",function(){
//                    next(e);
//                });

                Ctl.change(function (e) {
                    next({'value': $(e.target).val(), 'text': $(e.target).find("[selected='selected']").text()});
                });
                r365App.initSmartSelects($$(".page"));

            },
            error: function (err) {

            }
        });

    }

    ///Ctl
    // ,province_id,
    // val,
    // next,
    // selectedText
    function selectCity(Ctl, province_id, val, next, selectedText) {
        $$.ajax({
            url: '/city/getActiveList',
            type: 'POST',
            data: {province_id: province_id},
            success: function (data) {
                data = JSON.parse(data).data;
                var optsHTML = "";
                if (province_id == "") {
                    optsHTML += '<option value="" selected="selected">请选择</option>';
                }
                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    if (val) {
                        optsHTML += '<option value="' + item.city_id + '" ' + ((item.city_id == val) ? 'selected=selected' : '') + '>' + item.city_name + '</option>';
                    }
                    else if (selectedText) {
                        optsHTML += '<option value="' + item.city_id + '" ' + ((item.city_name == selectedText) ? 'selected=selected' : '') + '>' + item.city_name + '</option>';
                    }
                    else {
                        optsHTML += '<option value="' + item.city_id + '" >' + item.city_name + '</option>';
                    }
                }
                Ctl.html(
                    optsHTML
                );
                if (val) {
                    //Ctl.val(val);
                    next({'value': val, 'text': Ctl.find("[selected='selected']").text()})
                }
                else {
                    next({'value': Ctl.val(), 'text': Ctl.find("[selected='selected']").text()})
                }
                Ctl.change(function (e) {
                    next({'value': $(e.target).val(), 'text': $(e.target).find("[selected='selected']").text()});
                });
                r365App.initSmartSelects($$(".page"));

            },
            error: function (err) {

            }
        });
    }

    function selectCounty(Ctl, city_id, val, next, selectedText) {

        $$.ajax({
            url: '/county/getActiveList',
            type: 'POST',
            data: {city_id: city_id},
            success: function (data) {
                data = JSON.parse(data).data;
                var optsHTML = "";
                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    //optsHTML+='<option value="'+item.county_id+'" '+((item.county_id==val)?'selected=selected':'')+'>'+item.county_name+'</option>';
                    if (val) {
                        optsHTML += '<option value="' + item.county_id + '" ' + ((item.county_id == val) ? 'selected=selected' : '') + '>' + item.county_name + '</option>';
                    }
                    else if (selectedText) {
                        optsHTML += '<option value="' + item.county_id + '" ' + ((item.county_name == selectedText) ? 'selected=selected' : '') + '>' + item.county_name + '</option>';
                    }
                    else {
                        optsHTML += '<option value="' + item.county_id + '" >' + item.county_name + '</option>';
                    }
                }
                Ctl.html(
                    optsHTML
                );
                if (val) {
                    //Ctl.val(val);
                    next({'value': val, 'text': Ctl.find("[selected='selected']").text()})
                } else {
                    next({'value': Ctl.val(), 'text': Ctl.find("[selected='selected']").text()})
                }
                Ctl.change(function (e) {
                    next({'value': $(e.target).val(), 'text': $(e.target).find("[selected='selected']").text()});
                });
                r365App.initSmartSelects($$(".page"));

            },
            error: function (err) {

            }
        });
    }

    function selectDictionarylist(Ctl, category, val, next, filter) {
        $$.ajax({
            url: '/dictionary/selectDictionarylist',
            type: 'POST',
            data: {
                category: category,
                filter: filter.type
            },
            success: function (data) {
                data = JSON.parse(data).data;
                var optsHTML = "";
                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    optsHTML += '<option  value="' + item.key + '" ' + ((item.key == val) ? 'selected=selected' : '') + '>' + item.value1 + '</option>';
                }
                Ctl.html(
                    optsHTML
                );
                if (val) {
                    //Ctl.val(val);
                    next({'value': Ctl.val(), 'text': Ctl.find("[selected='selected']").text()})

                }
                Ctl.change(function (e) {
                    next({'value': $(e.target).val(), 'text': $(e.target).find("[selected='selected']").text()});
                });
                r365App.initSmartSelects($$(".page"));

                function hide() {
                    $(".item-after").hide();
                };
                window.onload = hide();

            },
            error: function (err) {

            }
        });
    }


    function selectDictionary(Ctl, category, val, next, filter) {
        $$.ajax({
            url: '/dictionary/getList',
            type: 'POST',
            data: {
                category: category,
                filter: filter.value2
            },
            success: function (data) {
                data = JSON.parse(data).data;
                var optsHTML = "";
                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    optsHTML += '<option value="' + item.key + '" ' + ((item.key == val) ? 'selected=selected' : '') + '>' + item.value1 + '</option>';
                }
                Ctl.html(
                    optsHTML
                );
                if (val) {
                    //Ctl.val(val);
                    next({'value': Ctl.val(), 'text': Ctl.find("[selected='selected']").text()})

                }
                Ctl.change(function (e) {
                    next({'value': $(e.target).val(), 'text': $(e.target).find("[selected='selected']").text()});
                });
                r365App.initSmartSelects($$(".page"));
            },
            error: function (err) {

            }
        });
    }

    function selectInstitutionDept(Ctl, institution_type, val, next) {

        $$.ajax({
            url: '/dictionary/getInstitutionDept',
            type: 'POST',
            data: {institution_type: institution_type},
            success: function (data) {
                data = JSON.parse(data).data;
                var optsHTML = "";
                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    optsHTML += '<option value="' + item.dept_id + '" ' + ((item.dept_id == val) ? 'selected=selected' : '') + '>' + item.dept_name + '</option>';
                }
                Ctl.html(
                    optsHTML
                );
//                if(val) {
//                    //Ctl.val(val);
//                    next({'value':Ctl.val(),'text':Ctl.find("[selected='selected']").text()} )
//
//                    r365App.initSmartSelects($$(".page"));
//                }
                if (val) {
                    next({'value': val, 'text': Ctl.find("[selected='selected']").text()})
                } else {
                    next({'value': Ctl.val(), 'text': Ctl.find("[selected='selected']").text()})
                }

                r365App.initSmartSelects($$(".page"));
                Ctl.change(function (e) {
                    next({'value': $(e.target).val(), 'text': $(e.target).find("[selected='selected']").text()});
                });
            },
            error: function (err) {

            }
        });
    }

        function selectdept_radio(Ctl, category, val, aa, next,bindings, filter) {
        var categorytype=category;
        $$.ajax({
            url: '/dictionary/selectdeptradio',
            type: 'POST',
            data: {
                category: categorytype,
                filter: filter.value2,
                filterType:filter.value3
            },
            success: function (data) {
                data = JSON.parse(data).data;
                if(data=="")
                {
                    $("#depthide").hide();
                }
                else
                {
                    var html = "";
                    for (var i = 0; i < data.length; i++) {
                        var item = data[i];
                        html += '   <li> <label class="label-radio item-content"> <input type="radio" name="my-radio" tpt="' + item.dept_name + '" value="' + item.dept_id + '"checked="checked"> <div class="item-inner" name="dpt"> <div class="item-title">' + item.dept_name + '</div> </div> </label> </li>';
                    }
                    Ctl.html(
                        html
                    );
                }
                hide();
                function hide() {
                    $(".item-after").hide();
                }
                $("input[name='my-radio']:checked").removeAttr("checked")
                $(".label-radio.item-content").click(function () {
                    document.getElementById("inputext").disabled = true;
                    $("#inputext").val("新部门名称")
                });
                if(_params.dptafter!="请选择")
                {
                    $("input[name='my-radio']").each(function(i,k){
                        var value =$(this).attr('tpt');
                        if(_params.dptafter==value)
                        {
                            $("input[name='my-radio']").get(i).checked=true;
                            return;
                        }
                        //else
                        //{
                        //    $("#inputext").val(_params.dptafter)
                        //    document.getElementById("inputext").disabled = false;
                        //}
                    });

                }


            }

        });
    }

    return {
        selectProvince: selectProvince,
        selectCity: selectCity,
        selectCounty: selectCounty,
        selectDictionary: selectDictionary,
        selectInstitutionDept: selectInstitutionDept,
        selectdept_radio: selectdept_radio,
        selectDictionarylist: selectDictionarylist,


    };
}();
