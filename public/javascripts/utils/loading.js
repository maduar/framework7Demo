/**
 * Created by 唐李锦 on 15/6/10.
 */
define([], function () {

    function modal(){
        var _modalTemplateTempDiv = document.createElement('div');
        var modalHTML = '';
        _modalTemplateTempDiv.innerHTML = "<div class='modal modal-no-buttons modal-in'><div class='modal-inner' style=''><div class='modal-title'>Loading...</div><div class='modal-text'><div class='preloader'></div></div></div></div>";
        //var modal = $(_modalTemplateTempDiv).children();
        //$('body').append(modal[0]);
        document.getElementsByTagName("body")[0].innerHTML += _modalTemplateTempDiv.innerHTML;
    }

    function openModal(){
        document.getElementsByClassName("modal modal-no-buttons")[0].style.display="block";
        document.getElementsByClassName("modal modal-no-buttons")[0].style.marginTop = - Math.round(document.getElementsByClassName("modal modal-no-buttons")[0].offsetHeight / 2) + 'px'
        document.getElementsByTagName("body")[0].innerHTML += '<div class="modal-overlay modal-overlay-visible"></div>';
    }
    modal();
    openModal();
});