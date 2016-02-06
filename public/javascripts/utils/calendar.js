/**
 * Created by 唐李锦 on 15/7/7.
 */
define([
    'text!tpl/utils/calendar/calendar.html',
    '../libs/moment.min',
    'text!tpl/utils/calendar/calendar_slide_week.html',
    'text!tpl/utils/calendar/calendar_slide_month.html',
    '../libs/jquery.rotate.min'
], function (
    calendarHTML,
    moment,
    calendarSlideWeekHTML,
    calendarSlideMonthHTML,
    rotate
) {

    var current_date;
    var current_view_mode = "";     //周视图，月视图
    var current_dom;
    var swiper_week;
    var swiper_month;
    var current_change_date;
    var is_rendering_week = false;
    var is_rendering_month = false;
    var current_calendar_content_html = "";
    var current_seperate_mode = "";     //当前手柄
    var current_icon_obj = {};
    var get_un_incon_date_fun;
    var last_send_date;

    //touch
    var content_touch_status = "";
    var init_touch_position;
    var last_touch_position;
    var changing_week_to_month = false;
    var changing_month_to_week = false;
    var is_downing = false;
    var is_uping = false;
    var arrow_is_changing = false;
    var arrow_changing_settimeout;

    //大小位置
    var complete_height_week;
    var complete_height_month;
    var content_height_subtract;        //内容需要减去的高度
    var week_current_date_icon = "div_calendar_icon_content_week";

    //picker
    var picker_year;
    var picker_month;

    function init(dom,option){
        current_date = moment();
        current_view_mode = "week";
        //current_view_mode = "month";
        current_seperate_mode = current_view_mode;
        current_dom = dom;
        content_height_subtract = option.content_height_subtract ? option.content_height_subtract: 0;
        current_icon_obj = {};
        last_send_date = null;
        get_un_incon_date_fun = null;
        if (option){
            if (option.date){
                current_date = moment([option.date.year, option.date.month, option.date.date]);
            }
            if (option.view_mode){
                current_view_mode = option.view_mode;
            }
            if (option.change_date){
                current_change_date = option.change_date;
            }
            if (option.calendar_content_html){
                current_calendar_content_html = option.calendar_content_html;
            }
            if (option.icon_obj){
                current_icon_obj = option.icon_obj;
            }
            if (option.get_un_incon_date){
                get_un_incon_date_fun = option.get_un_incon_date;
            }
        }
        //destory
        destory();
        //初始化
        var render_result;
        if (current_view_mode == "week"){
            render_result = render_calender_week_date(init_swiper_week_date());
        }
        else if (current_view_mode == "month"){
            render_result = render_calender_month_date(init_swiper_month_date());
        }
        //控制年月显示的位置
        render_year_month_extension();
        //侦听手柄的拖动
        set_listener_calendar_sperate_touch();
        //快速选择年月
        bind_picker_year_month();
        //显示今天按钮的颜色
        document.getElementById("embed_today").onload = function(e){
            set_today_btn_color();
            set_date_picker_position();
            setTimeout(function(){set_today_div_position();},500);
        };
        //设置拖动手柄图案
        set_separate_icon();
        //添加今天按钮事件
        set_tody_btn_event();
        //返回未被标注的日期
        if (get_un_incon_date_fun && render_result && render_result.un_incon_date && render_result.un_incon_date.length > 0){
            get_un_incon_date_fun(render_result.un_incon_date);
        }
    }

    function destory(){
        if(swiper_week){
            swiper_week.destroy();
        }
        if (swiper_month){
            swiper_week.destroy();
        }
        if($("#div_calendar_selecter").length > 0){
            $("#div_calendar_selecter").remove();
        }
        if ($("#div_calendar_sperate_container").length > 0){
            $("#div_calendar_sperate_container").remove();
        }
        if($("#div_calendar_content").length > 0){
            $("#div_calendar_content").remove();
        }
    }

    //初始化month swiper
    function init_swiper_month_date(){
        //根据current_date生成当月，前月，后月的html
        //当月
        var current_month_weeks = get_all_date_by_month(current_date.year(),current_date.month());
        //上月
        var prev_month = current_date.clone().subtract(1, 'months');
        var prev_month_weeks = get_all_date_by_month(prev_month.year(),prev_month.month());
        //下月
        var next_month = current_date.clone().add(1, 'months');
        var next_month_weeks = get_all_date_by_month(next_month.year(),next_month.month());
        return {
            prev_month:prev_month,
            prev_month_weeks:prev_month_weeks,
            current_month:current_date.clone(),
            current_month_weeks:current_month_weeks,
            next_month:next_month,
            next_month_weeks:next_month_weeks
        };
    }

    //生成用于模板显示的数据
    function get_display_calender_date_month(calender_date){
        var result = calender_date;
        result.un_icon_date = [];

        result.prev_month = get_display_calender_date(result.prev_month);
        var prev_month_weeks_array = get_display_calender_date_arr_month(result.prev_month_weeks,result.prev_month);
        result.prev_month_weeks = prev_month_weeks_array.result;
        result.un_icon_date = result.un_icon_date.concat(prev_month_weeks_array.un_has_icon_date);

        result.current_month = get_display_calender_date(result.current_month);
        var current_month_weeks_array = get_display_calender_date_arr_month(result.current_month_weeks,result.current_month);
        result.current_month_weeks = current_month_weeks_array.result;
        result.un_icon_date = result.un_icon_date.concat(current_month_weeks_array.un_has_icon_date);

        result.next_month = get_display_calender_date(result.next_month);
        var next_month_weeks_array = get_display_calender_date_arr_month(result.next_month_weeks,result.next_month);
        result.next_month_weeks = next_month_weeks_array.result;
        result.un_icon_date = result.un_icon_date.concat(next_month_weeks_array.un_has_icon_date);

        return result;
    }

    //渲染 month
    function render_calender_month_date(calender_date){
        calender_date = get_display_calender_date_month(calender_date);
        //加载slide的HTML
        var compiledTemplate_slide = Template7.compile(calendarSlideMonthHTML);
        var html_slide_prev_month = compiledTemplate_slide({month_weeks:calender_date.prev_month_weeks});
        var html_slide_current_month = compiledTemplate_slide({month_weeks:calender_date.current_month_weeks});
        var html_slide_next_month = compiledTemplate_slide({month_weeks:calender_date.next_month_weeks});
        //判断是否已加载过
        if (current_dom.find("#div_calendar_selecter").length == 0){
            //加载html
            var compiledTemplate = Template7.compile(calendarHTML);
            var html = compiledTemplate({
                year: current_date.year(),
                month:current_date.month() + 1,
                html_slide_prev_month:html_slide_prev_month,
                html_slide_current_month:html_slide_current_month,
                html_slide_next_month:html_slide_next_month
            });
            current_dom.html(html);
            //设置内容
            $("#div_calendar_content").html(current_calendar_content_html);
        }
        else{
            //已加载过
            var container = $("#div_calender_date_month").children("div");
            container.empty();
            container.append(html_slide_prev_month);
            container.append(html_slide_current_month);
            container.append(html_slide_next_month);
        }
        //添加事件
        $("#div_calender_date_month").find("div[name=div_calendar_date_item]").bind("click",click_date_item);

        $("#div_calender_date_week").hide();
        $("#div_calender_date_month").show();
        swiper_month = r365App.swiper('#div_calender_date_month',{
            initialSlide:1,         //默认第二页
            onSliderMove:render_next_month,
            onSlideChangeStart:start_render_month
        });
        //添加事件
        $("#div_calender_date_month").find("div[name=div_calendar_date_item]").bind("click",click_date_item);
        return {
            un_incon_date:calender_date.un_icon_date
        };
    }

    //滑动 月
    function render_next_month(sender){
        if (is_rendering_month){
            return;
        }
        else{
            is_rendering_month = true;
        }
        //获取当前页的日期
        var current_date_container = $(sender.slides[sender.activeIndex]).find("[data-is-current=true]");
        var next_month = moment([current_date_container.attr("data-display-year"), current_date_container.attr("data-display-month") - 1, current_date_container.attr("data-display-date")]);
        //判断上一页，或下一页有没有
        if (sender.activeIndex == 0 || sender.activeIndex == (sender.slides.length - 1)){
            //没有上一页，或下一页
            if (sender.activeIndex == 0){
                next_month.subtract(1, 'month');
            }
            else if (sender.activeIndex == (sender.slides.length - 1)){
                next_month.add(1, 'month');
            }
            var next_month_weeks = get_all_date_by_month(next_month.year(),next_month.month(),next_month.date());
            var temp_next_month_weeks = get_display_calender_date_arr_month(next_month_weeks,next_month);
            next_month_weeks = temp_next_month_weeks.result;
            var compiledTemplate_slide = Template7.compile(calendarSlideMonthHTML);
            var html_slide_next_momth = compiledTemplate_slide({month_weeks:next_month_weeks});
            var new_slide;
            if (sender.activeIndex == 0) {
                sender.prependSlide([html_slide_next_momth]);
                new_slide = sender.slides[0];
            }
            else if (sender.activeIndex == (sender.slides.length - 1)){
                sender.appendSlide([html_slide_next_momth]);
                new_slide = sender.slides[sender.slides.length - 1];
            }
            $(new_slide).find("div[name=div_calendar_date_item]").bind("click",click_date_item);
            if (get_un_incon_date_fun && temp_next_month_weeks && temp_next_month_weeks.un_has_icon_date && temp_next_month_weeks.un_has_icon_date.length > 0){
                get_un_incon_date_fun(temp_next_month_weeks.un_has_icon_date);
            }
        }
    }

    function start_render_month(sender){
        is_rendering_month = false;
        var current_date_container = $(sender.slides[sender.activeIndex]).find("[data-is-current=true]");
        var display_year = current_date_container.attr("data-display-year");
        var display_month = current_date_container.attr("data-display-month");
        var display_date = current_date_container.attr("data-display-date");
        current_date = moment([display_year,display_month - 1,display_date]);
        $("#sp_calendar_current_year").html(display_year);
        $("#sp_calendar_current_month").html(display_month);
        if (current_change_date && ((last_send_date && current_date.format() != last_send_date.format()) || !last_send_date)){
            last_send_date = current_date.clone();
            current_change_date({
                year:display_year,
                month:display_month,
                date:display_date
            });
        }
        //将当前swiper容器高度定位当前slide也高度
        $("#div_calender_date_month").height($(sender.slides[sender.activeIndex]).find("div[name=div_month_week_item]").length * 34);
        //设置内容高度
        set_div_calendar_content_height();
        set_today_btn_color();
        set_date_picker_position();
        set_today_div_position();
    }

    //初始化week swiper
    function init_swiper_week_date(){
        //根据current_date生成当周，前周，后周的html
        //当周
        var current_week_days = get_all_date_by_week(current_date.year(),current_date.month(),current_date.date());
        //上周
        var prev_week = current_date.clone().subtract(1, 'week');
        var prev_week_days = get_all_date_by_week(prev_week.year(),prev_week.month(),prev_week.date());
        //下周
        var next_week = current_date.clone().add(1, 'week');
        var next_week_days = get_all_date_by_week(next_week.year(),next_week.month(),next_week.date());
        return {
            prev_week:prev_week,
            prev_week_days:prev_week_days,
            current_week:current_date.clone(),
            current_week_days:current_week_days,
            next_week:next_week,
            next_week_days:next_week_days
        };
    }

    //获取显示的日期
    function get_display_calender_date_arr(days,current_day,mode){
        var un_has_icon_date = [];
        var result = days;
        $.each(result,function(i,item){
            result[i].display_year = result[i].year();
            result[i].display_month = result[i].month() + 1;
            result[i].display_date = result[i].date();
            //当天
            if (result[i].year() == current_day.year()
                && result[i].month() == current_day.month()
                && result[i].date() == current_day.date()){
                result[i].is_current = true;
            }
            else{
                if (mode == "month"){
                    //不是同月的
                    if (result[i].month() != current_day.month()){
                        result[i].un_current_month = true;
                    }
                }
                else if (mode == "week"){
                    result[i].un_current_date = true;       //周视图里面除了当天，其他的天都是灰色的
                }
            }
            //判断当前是否有icon记录
            var temp_month = result[i].month();
            temp_month++;
            if(current_icon_obj[result[i].year().toString()]
                && current_icon_obj[result[i].year().toString()][temp_month.toString()]
                && current_icon_obj[result[i].year().toString()][temp_month.toString()][result[i].date().toString()]){
                if (current_icon_obj[result[i].year().toString()][temp_month.toString()][result[i].date().toString()] == "show"){
                    result[i].has_data_icon = true;
                }
            }
            else{
                //没有被加载过
                //先赋值loading
                current_icon_obj[result[i].year().toString()] = current_icon_obj[result[i].year().toString()]?current_icon_obj[result[i].year().toString()]:{};
                current_icon_obj[result[i].year().toString()][temp_month.toString()] = current_icon_obj[result[i].year().toString()][temp_month.toString()]?current_icon_obj[result[i].year().toString()][temp_month.toString()]:{};
                current_icon_obj[result[i].year().toString()][temp_month.toString()][result[i].date().toString()] = current_icon_obj[result[i].year().toString()][temp_month.toString()][result[i].date().toString()]?current_icon_obj[result[i].year().toString()][temp_month.toString()][result[i].date().toString()]:"loading";
                un_has_icon_date.push({
                    year:result[i].year(),
                    month:temp_month,
                    date:result[i].date()
                });
            }
        });
        return {
            result:result,
            un_has_icon_date:un_has_icon_date
        };
    }

    function get_display_calender_date_arr_month(days_arr,current_day){
        var result = days_arr;
        var un_has_icon_date = [];
        $.each(result,function(i,item){
            var temp_days = get_display_calender_date_arr(result[i],current_day,"month");
            result[i] = {week_days: temp_days.result};
            un_has_icon_date = un_has_icon_date.concat(temp_days.un_has_icon_date);
        });
        return {
            result:result,
            un_has_icon_date:un_has_icon_date
        };
    }

    function get_display_calender_date(day){
        var result = day;
        result.display_year = result.year();
        result.display_month = result.month() + 1;
        result.display_date = result.date();
        return result;
    }

    //生成用于模板显示的数据
    function get_display_calender_date_week(calender_date){
        var result = calender_date;
        result.un_icon_date = [];
        result.prev_week = get_display_calender_date(result.prev_week);
        var prev_week_days_array = get_display_calender_date_arr(result.prev_week_days,result.prev_week,"week");
        result.prev_week_days = prev_week_days_array.result;
        result.un_icon_date = result.un_icon_date.concat(prev_week_days_array.un_has_icon_date);


        result.current_week = get_display_calender_date(result.current_week);
        var current_week_days_array = get_display_calender_date_arr(result.current_week_days,result.current_week,"week");
        result.current_week_days = current_week_days_array.result;
        result.un_icon_date = result.un_icon_date.concat(current_week_days_array.un_has_icon_date);

        result.next_week = get_display_calender_date(result.next_week);
        var next_week_days_array = get_display_calender_date_arr(result.next_week_days,result.next_week,"week");
        result.next_week_days = next_week_days_array.result;
        result.un_icon_date = result.un_icon_date.concat(next_week_days_array.un_has_icon_date);
        return result;
    }

    //渲染 week
    function render_calender_week_date(calender_date){
        calender_date = get_display_calender_date_week(calender_date);
        //加载slide的HTML
        var compiledTemplate_slide = Template7.compile(calendarSlideWeekHTML);
        var html_slide_prev_week = compiledTemplate_slide({week_days:calender_date.prev_week_days});
        var html_slide_current_week = compiledTemplate_slide({week_days:calender_date.current_week_days});
        var html_slide_next_week = compiledTemplate_slide({week_days:calender_date.next_week_days});

        //判断是否已加载过
        if (current_dom.find("#div_calendar_selecter").length == 0){
            //加载html
            var compiledTemplate = Template7.compile(calendarHTML);
            var html = compiledTemplate({
                year: current_date.year(),
                month:current_date.month() + 1,
                html_slide_prev_week:html_slide_prev_week,
                html_slide_current_week:html_slide_current_week,
                html_slide_next_week:html_slide_next_week
            });
            current_dom.html(html);
            //设置内容
            $("#div_calendar_content").html(current_calendar_content_html);
        }
        else{
            //已加载过
            var container = $("#div_calender_date_week").children("div");
            container.empty();
            container.append(html_slide_prev_week);
            container.append(html_slide_current_week);
            container.append(html_slide_next_week);
        }
        //添加事件
        $("#div_calender_date_week").find("div[name=div_calendar_date_item]").bind("click",click_date_item);

        $("#div_calender_date_week").show();
        $("#div_calender_date_month").hide();
        swiper_week = r365App.swiper('#div_calender_date_week',{
            initialSlide:1,          //默认第二页
            onSliderMove:render_next_week,
            onSlideChangeStart:start_render_week
        });
        return {
            un_incon_date:calender_date.un_icon_date
        };
    }

    //根据月份获取当月的全部天
    function get_all_date_by_month(year,month){
        var current_month = moment([year, month, 1]);
        var weeks = [];     //周的数组
        //获取前天月第一天和最后一天
        var first_day = current_month.clone().startOf('month');
        var last_day = current_month.clone().endOf('month');
        //获取第一天是星期几
        var first_day_w = first_day.day();
        var last_day_w = last_day.day();
        var begin_push = false;
        var end_push = false;
        var push_date = first_day.clone();
        while(true){
            if (end_push){
                break;
            }
            weeks.push({});
            for(var i = 0; i < 7; i++){
                if (weeks.length == 1){
                    //第一周
                    if (first_day_w == i){
                        begin_push = true;
                    }
                    if (begin_push){
                        weeks[weeks.length - 1][i] = push_date.clone();
                        push_date.add(1, 'd');
                    }
                    else{
                        weeks[weeks.length - 1][i] = push_date.clone().subtract(first_day_w - i, 'd');
                    }
                }
                else {
                    if (push_date.format("YYYY-MM-DD") == last_day.format("YYYY-MM-DD")){
                        end_push = true;
                    }
                    weeks[weeks.length - 1][i] = push_date.clone();
                    push_date.add(1, 'd');
                }
            }
        }
        return weeks;
    }

    //根据日期获取当星期的全部天
    function get_all_date_by_week(year,month, date){
        var current_week = moment([year, month, date]);
        var week = [];
        var first_day = current_week.clone().startOf('week');
        var push_date = first_day.clone();
        for(var i = 0; i < 7; i++){
            week.push(push_date.clone());
            push_date.add(1, 'd');
        }
        return week;
    }

    function start_render_week(sender){
        is_rendering_week = false;
        var current_date_container = $(sender.slides[sender.activeIndex]).find("[data-is-current=true]");
        var display_year = current_date_container.attr("data-display-year");
        var display_month = current_date_container.attr("data-display-month");
        var display_date = current_date_container.attr("data-display-date");
        current_date = moment([display_year,display_month - 1,display_date]);
        $("#sp_calendar_current_year").html(display_year);
        $("#sp_calendar_current_month").html(display_month);
        if (current_change_date && ((last_send_date && current_date.format() != last_send_date.format()) || !last_send_date)){
            last_send_date = current_date.clone();
            current_change_date({
                year:display_year,
                month:display_month,
                date:display_date
            });
        }
        //设置内容高度
        set_div_calendar_content_height();
        set_today_btn_color();
        set_date_picker_position();
        set_today_div_position();
    }

    //滑动 周
    function render_next_week(sender,event){
        if (is_rendering_week){
            return;
        }
        else{
            is_rendering_week = true;
        }
        //获取当前页的日期
        var current_date_container = $(sender.slides[sender.activeIndex]).find("[data-is-current=true]");
        var next_week = moment([current_date_container.attr("data-display-year"), current_date_container.attr("data-display-month") - 1, current_date_container.attr("data-display-date")]);
        //判断上一页，或下一页有没有
        if (sender.activeIndex == 0 || sender.activeIndex == (sender.slides.length - 1)){
            //没有上一页，或下一页
            if (sender.activeIndex == 0){
                next_week.subtract(1, 'week');
            }
            else if (sender.activeIndex == (sender.slides.length - 1)){
                next_week.add(1, 'week');
            }
            var next_week_days = get_all_date_by_week(next_week.year(),next_week.month(),next_week.date());
            var temp_next_week_days = get_display_calender_date_arr(next_week_days,next_week,"week");

            next_week_days = temp_next_week_days.result;
            var compiledTemplate_slide = Template7.compile(calendarSlideWeekHTML);
            var html_slide_next_week = compiledTemplate_slide({week_days:next_week_days});
            var new_slide;
            if (sender.activeIndex == 0) {
                sender.prependSlide([html_slide_next_week]);
                new_slide = sender.slides[0];
            }
            else if (sender.activeIndex == (sender.slides.length - 1)){
                sender.appendSlide([html_slide_next_week]);
                new_slide = sender.slides[sender.slides.length - 1];
            }
            $(new_slide).find("div[name=div_calendar_date_item]").bind("click",click_date_item);
            if (get_un_incon_date_fun && temp_next_week_days && temp_next_week_days.un_has_icon_date && temp_next_week_days.un_has_icon_date.length){
                get_un_incon_date_fun(temp_next_week_days.un_has_icon_date);
            }
        }
    }

    //控制年月显示的位置
    function render_year_month_extension(){
        var col_width = $($("#div_calendar_date_title").children(".col-auto")[0]).width();
        $("#label_calendar_year_month").css("paddingLeft", col_width / 2 - 10);
        $("#label_calendar_extension").css("paddingRight", col_width / 2 - 10);
    }

    //设置内容高度
    function set_div_calendar_content_height(){
        var height = $("#div_calendar_content").parent().height() - $("#div_calendar_selecter").innerHeight() - 16 - content_height_subtract;
        $("#div_calendar_content").css("height",height + "px");
    }

    //侦听div_calendar_content的滚动
    function set_listener_calendar_sperate_touch(){
        var touch_obj_arr = [];
        touch_obj_arr.push(document.getElementById("div_calendar_sperate_container"));
        touch_obj_arr.push(document.getElementById("div_calendar_selecter"));
        $.each(touch_obj_arr,function(i,div_calendar_content){
            div_calendar_content.addEventListener("touchstart",function(e){
                e.preventDefault();
                content_touch_status = "start";
                // 手指
                if (e.targetTouches.length >= 1){
                    var touch = e.targetTouches[0];
                    init_touch_position = {
                        x:touch.pageX,
                        y:touch.pageY
                    };
                    last_touch_position = {
                        x:touch.pageX,
                        y:touch.pageY
                    };
                }
            },false);
            div_calendar_content.addEventListener("touchend",function(e){
                e.preventDefault();
                content_touch_status = "end";
                touch_end();
            },false);
            div_calendar_content.addEventListener("touchmove", function(e){
                e.preventDefault();
                if (content_touch_status == "start"){
                    // 手指
                    if (e.targetTouches.length >= 1){
                        var touch = e.targetTouches[0];

                        touch_move({
                            x:touch.pageX,
                            y:touch.pageY
                        });
                    }
                }
            }, false);
            div_calendar_content.addEventListener("touchcancel", function(e){
                e.preventDefault();
                content_touch_status = "cancel";
                touch_end();
            }, false);
        });
        //var div_calendar_content = document.getElementById("div_calendar_sperate_container");


    }

    //移动touch
    function touch_move(cfg){
        //计算y轴方向移动的距离
        var distance_moved = cfg.y - last_touch_position.y;
        if (distance_moved <= 0){
            //手指向上滑
            is_downing = false;
            is_uping = true;
            if (!complete_height_week){
                complete_height_week = 43;
            }
            if (current_view_mode == "month"){
                changing_month_to_week = true;
                var current_month_height = $("#div_calender_date_month").height() - Math.abs(distance_moved);
                if (complete_height_week <= current_month_height){
                    $("#div_calender_date_month").height($("#div_calender_date_month").height() - Math.abs(distance_moved));
                    $("#div_calendar_content").height($("#div_calendar_content").height() + Math.abs(distance_moved));
                }
            }
            else if (changing_week_to_month){
                var current_month_height = $("#div_calender_date_month").height() - Math.abs(distance_moved);
                if (complete_height_week <= current_month_height){
                    $("#div_calender_date_month").height($("#div_calender_date_month").height() - Math.abs(distance_moved));
                    $("#div_calendar_content").height($("#div_calendar_content").height() + Math.abs(distance_moved));
                }
            }
        }
        else{
            //手指向下滑
            is_downing = true;
            is_uping = false;
            //判断当前显示的视图是否是周视图
            if (current_view_mode == "week"){
                changing_week_to_month = true;
                if (!$("#div_calender_date_month").is(":visible")){
                    complete_height_week = $("#div_calender_date_week").height();
                    //显示月视图
                    var render_result = render_calender_month_date(init_swiper_month_date());
                    if (get_un_incon_date_fun && render_result && render_result.un_incon_date && render_result.un_incon_date.length > 0){
                        get_un_incon_date_fun(render_result.un_incon_date);
                    }
                    complete_height_month = $("#div_calender_date_month").height();
                    $("#div_calender_date_month").height(complete_height_week);
                    $("#div_calendar_content").height($("#div_calendar_content").height() + complete_height_month - complete_height_week);
                }
                var current_month_height = $("#div_calender_date_month").height() + distance_moved;
                if (complete_height_month >= current_month_height){
                    $("#div_calender_date_month").height($("#div_calender_date_month").height() + distance_moved);
                    $("#div_calendar_content").height($("#div_calendar_content").height() - distance_moved);
                }
            }
            else if (changing_month_to_week){
                var current_month_height = $("#div_calender_date_month").height() + distance_moved;
                if (complete_height_month >= current_month_height){
                    $("#div_calender_date_month").height($("#div_calender_date_month").height() + distance_moved);
                    $("#div_calendar_content").height($("#div_calendar_content").height() - distance_moved);
                }
            }
        }
        last_touch_position = cfg;
    }

    //结束移动touch
    function touch_end(){
        var render_result;
        if (changing_week_to_month){
            if (is_uping){
                render_result = render_calender_week_date(init_swiper_week_date());
            }
            else{
                var current_month_height = $("#div_calender_date_month").height();
                if (current_month_height > complete_height_week){
                    $("#div_calender_date_month").height(complete_height_month);
                    current_view_mode = "month";
                }
            }

        }
        if (changing_month_to_week){
            if (is_downing){
                $("#div_calender_date_month").height(complete_height_month);
            }
            else{
                var current_month_height = $("#div_calender_date_month").height();
                if (current_month_height < complete_height_month){
                    render_result = render_calender_week_date(init_swiper_week_date());
                    current_view_mode = "week";
                }
            }
        }
        changing_week_to_month = false;
        changing_month_to_week = false;
        current_seperate_mode = current_view_mode;
        set_separate_icon();
        if (get_un_incon_date_fun && render_result && render_result.un_incon_date && render_result.un_incon_date.length > 0){
            get_un_incon_date_fun(render_result.un_incon_date);
        }
    }

    function click_date_item(e){
        if(!$(this).attr("data-is-current")){
            var year = $(this).attr("data-display-year");
            var month = $(this).attr("data-display-month");
            var date = $(this).attr("data-display-date");
            current_date = moment([year,month - 1,date]);
            var render_result;
            if (current_view_mode == "week"){
                render_result = render_calender_week_date(init_swiper_week_date());
            }
            else if (current_view_mode == "month"){
                render_result = render_calender_month_date(init_swiper_month_date());
            }
            set_today_btn_color();
            if (get_un_incon_date_fun && render_result && render_result.un_incon_date && render_result.un_incon_date.length > 0){
                get_un_incon_date_fun(render_result.un_incon_date);
            }
        }
    }

    //快速选择年月
    function bind_picker_year_month(){
        var start_year = 1950;
        var end_year = 2030;
        var pickerInline = r365App.picker({
            input: '#input_calendar_picker-date',
            rotateEffect: true,
            toolbarTemplate:
            '<div class="toolbar">' +
            '<div class="toolbar-inner">' +
            '<div class="left">' +
            '</div>' +
            '<div class="right">' +
            '<a href="#" name="lnk_picker_year_month_ok" class="link close-picker">完成</a>' +
            '</div>' +
            '</div>' +
            '</div>',
            value: [current_date.year(),current_date.month()],
            onChange: function (picker, values, displayValues) {
                picker_year = values[0];
                picker_month = values[1]* 1 + 1;
            },
            onOpen:function(p){
                p.setValue([current_date.year(),current_date.month()]);
                $("a[name=lnk_picker_year_month_ok]").on("click",function(e){
                    current_date = moment([picker_year, picker_month-1, current_date.date()]);
                    var render_result;
                    if (current_view_mode == "week"){
                        render_result = render_calender_week_date(init_swiper_week_date());
                    }
                    else if (current_view_mode == "month"){
                        render_result = render_calender_month_date(init_swiper_month_date());
                    }
                    if (get_un_incon_date_fun && render_result && render_result.un_incon_date && render_result.un_incon_date.length > 0) {
                        get_un_incon_date_fun(render_result.un_incon_date);
                    }
                });
            },
            formatValue: function (p, values, displayValues) {
                var month=(values[1] * 1+ 1) < 10 ? ('0'+(values[1] * 1+ 1)):(values[1] * 1+ 1);

                return values[0] + '-' + month;
            },
            cols: [
                // Years
                {
                    values: (function () {
                        var arr = [];
                        for (var i = start_year; i <= end_year; i++) {
                            arr.push(i);
                        }
                        return arr;
                    })(),
                    displayValues: (function () {
                        var arr = [];
                        for (var i = start_year; i <= end_year; i++) {
                            arr.push(i + "年");
                        }
                        return arr;
                    })(),
                    textAlign: 'left'
                },
                // Months
                {
                    values: [0,1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
                    displayValues: ('1月 2月 3月 4月 5月 6月 7月 8月 9月 10月 11月 12月').split(' ')

                }
            ]
        });
    }

    //设置今天按钮的颜色
    function set_today_btn_color(){
        if (document.getElementById("embed_today").getSVGDocument()){
            if (current_date.year() == moment().year() && current_date.month() == moment().month() && current_date.date() == moment().date()){
                document.getElementById("embed_today").getSVGDocument().getElementById("今字").style.fill = "#fb984a";
            }
            else{
                document.getElementById("embed_today").getSVGDocument().getElementById("今字").style.fill = "#666666";
            }
        }
    }

    //定义今天div的位置
    function set_today_div_position(){
        if (document.getElementById("embed_today").getSVGDocument()){
            var embed_today = $("#embed_today");
            $("#div_today").css("width",embed_today.outerWidth())
                .css("height",embed_today.outerHeight())
                .css("position","absolute")
                .css("top",embed_today.offset().top)
                .css("left",embed_today.offset().left)
                .css("z-index",10);
        }
    }

    //定义快速选择月份的位置
    function set_date_picker_position(){
        $("#input_calendar_picker-date").width($("#label_calendar_year_month").outerWidth())
            .height($("#label_calendar_year_month").outerHeight() + 5).css("top",$('#label_calendar_year_month').offset().top);
    }

    //添加今天按钮事件
    function set_tody_btn_event(){
        $("#div_today").click(function(e){
            if (current_date.year() == moment().year() && current_date.month() == moment().month() && current_date.date() == moment().date()){
                return;
            }
            else{
                current_date = moment();
                if (current_view_mode == "week"){
                    render_calender_week_date(init_swiper_week_date());
                }
                else if (current_view_mode == "month"){
                    render_calender_month_date(init_swiper_month_date());
                }
                set_today_btn_color();
            }
        });
    }

    //设置手柄的图案
    function set_separate_icon(){
        arrow_is_changing = true;
        if (arrow_changing_settimeout){
            clearTimeout(arrow_changing_settimeout);
            arrow_changing_settimeout = null;
        }
        if (current_seperate_mode == "week"){
            set_arrow_rotate(0);
        }
        else if (current_seperate_mode == "month"){
            set_arrow_rotate(180);
        }
    }

    //设置转动
    function set_arrow_rotate(rotate){
        $("#embed_arrow").rotate({animateTo:rotate, duration:100});
    }

    //设置点
    function set_icon(un_incon_date){
        current_icon_obj[un_incon_date.year.toString()] = current_icon_obj[un_incon_date.year.toString()]?current_icon_obj[un_incon_date.year.toString()]:{};
        current_icon_obj[un_incon_date.year.toString()][un_incon_date.month.toString()] = current_icon_obj[un_incon_date.year.toString()][un_incon_date.month.toString()]?current_icon_obj[un_incon_date.year.toString()][un_incon_date.month.toString()]:{};
        current_icon_obj[un_incon_date.year.toString()][un_incon_date.month.toString()][un_incon_date.date.toString()] = "show";
        //显示icon
        var icon = $("div[name=div_calendar_date_icon][data-display-year=" + un_incon_date.year + "][data-display-month=" + un_incon_date.month + "][data-display-date=" + un_incon_date.date + "]");
        icon.css("visibility","visible");
        if (current_view_mode == "week"){
            if ($("div[name=div_calendar_date_item][data-display-year=" + un_incon_date.year + "][data-display-month=" + un_incon_date.month + "][data-display-date=" + un_incon_date.date + "]").attr("data-is-current")){
                icon.children().addClass(week_current_date_icon);
            }
        }
    }

    //初始化
    return {
        init: init,
        set_icon:set_icon
    };
});