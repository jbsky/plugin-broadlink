
/* This file is part of Jeedom.
 *
 * Jeedom is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Jeedom is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Jeedom. If not, see <http://www.gnu.org/licenses/>.
 */
  $('#bt_resetSearch').off('click').on('click', function () {
     $('#in_searchEqlogic').val('')
     $('#in_searchEqlogic').keyup();
 })
 
 $('.changeIncludeState').on('click', function () {
	var state = $(this).attr('data-state');
	changeIncludeState(state);
});

$('#bt_autoDetectModule').on('click', function () {
    bootbox.confirm('{{Etes-vous sûr de vouloir récréer toutes les commandes ? Cela va supprimer les commandes existantes}}', function (result) {
        if (result) {
            $.ajax({// fonction permettant de faire de l'ajax
                type: "POST", // méthode de transmission des données au fichier php
                url: "plugins/broadlink/core/ajax/broadlink.ajax.php", // url du fichier php
                data: {
                    action: "autoDetectModule",
                    id: $('.eqLogicAttr[data-l1key=id]').value(),
                },
                dataType: 'json',
                global: false,
                error: function (request, status, error) {
                    handleAjaxError(request, status, error);
                },
                success: function (data) { // si l'appel a bien fonctionné
                if (data.state != 'ok') {
                    $('#div_alert').showAlert({message: data.result, level: 'danger'});
                    return;
                }
                $('#div_alert').showAlert({message: '{{Opération réalisée avec succès}}', level: 'success'});
                $('.li_eqLogic[data-eqLogic_id=' + $('.eqLogicAttr[data-l1key=id]').value() + ']').click();
            }
        });
        }
    });
});

 $('#bt_healthbroadlink').on('click', function () {
    $('#md_modal').dialog({title: "{{Santé Broadlink}}"});
    $('#md_modal').load('index.php?v=d&plugin=broadlink&modal=health').dialog('open');
});

$('#btn_sync').on('click', function () {
    var logicalId = $('.eqLogicAttr[data-l1key=logicalId]').value();
    $('#md_modal').dialog({title: "{{Synchronisation Broadlink}}"});
    $('#md_modal').load('index.php?v=d&plugin=broadlink&modal=synchro&id='+logicalId).dialog('open');
});

 $('.eqLogicAttr[data-l1key=configuration][data-l2key=device]').on('change', function () {
  if($('.eqLogicDisplayCard.active').attr('data-eqlogic_id') != ''){
   getModelListParam($(this).value(),$('.eqLogicDisplayCard.active').attr('data-eqlogic_id'));
}else{
    $('#img_device').attr("src",'plugins/broadlink/plugin_info/broadlink_icon.png');
}
});

 $('.eqLogicAttr[data-l1key=configuration][data-l2key=iconModel]').on('change', function () {
  if($(this).value() != '' && $(this).value() != null){
    $('#img_device').attr("src", 'plugins/broadlink/core/config/devices/'+$(this).value()+'.png');
}
});

 $('body').delegate('.cmd .cmdAttr[data-l1key=type]', 'change', function () {
    if ($(this).value() == 'action') {
        $(this).closest('.cmd').find('.cmdAttr[data-l1key=configuration][data-l2key=id]').show();
        $(this).closest('.cmd').find('.cmdAttr[data-l1key=configuration][data-l2key=group]').show();
    } else {
        $(this).closest('.cmd').find('.cmdAttr[data-l1key=configuration][data-l2key=id]').hide();
        $(this).closest('.cmd').find('.cmdAttr[data-l1key=configuration][data-l2key=group]').hide();
    }
});
 function getModelListParam(_conf,_id) {
    $.ajax({
        type: "POST", 
        url: "plugins/broadlink/core/ajax/broadlink.ajax.php", 
        data: {
            action: "getModelListParam",
            conf: _conf,
            id: _id,
        },
        dataType: 'json',
        global: false,
        error: function (request, status, error) {
            handleAjaxError(request, status, error);
        },
        success: function (data) { 
        if (data.state != 'ok') {
            $('#div_alert').showAlert({message: data.result, level: 'danger'});
            return;
        }
        var options = '';
        for (var i in data.result[0]) {
            if (data.result[0][i]['selected'] == 1){
                options += '<option value="'+i+'" selected>'+data.result[0][i]['value']+'</option>';
            } else {
                options += '<option value="'+i+'">'+data.result[0][i]['value']+'</option>';
            }
        }
		if (data.result[1] == true){
			$(".learnCommand").show();
		} else {
			$(".learnCommand").hide();
		}
		$(".modelList").show();
        $(".listModel").html(options);
		$icon = $('.eqLogicAttr[data-l1key=configuration][data-l2key=iconModel]').value();
		if($icon != '' && $icon != null){
			$('#img_device').attr("src", 'plugins/broadlink/core/config/devices/'+$icon+'.png');
		} else {
			$('#img_device').attr("src", 'plugins/broadlink/plugin_info/broadlink_icon.png');
		}
    }
});
}

$("#table_cmd").sortable({axis: "y", cursor: "move", items: ".cmd", placeholder: "ui-state-highlight", tolerance: "intersect", forcePlaceholderSize: true});


function addCmdToTable(_cmd) {
    if (!isset(_cmd)) {
        var _cmd = {configuration: {}};
    }
    var tr = '<tr class="cmd" data-cmd_id="' + init(_cmd.id) + '">';
    tr += '<td>';
    tr += '<div class="row">';
    tr += '<div class="col-sm-6">';
    tr += '<a class="cmdAction btn btn-default btn-sm" data-l1key="chooseIcon"><i class="fa fa-flag"></i> Icône</a>';
    tr += '<span class="cmdAttr" data-l1key="display" data-l2key="icon" style="margin-left : 10px;"></span>';
    tr += '</div>';
    tr += '<div class="col-sm-6">';
    tr += '<input class="cmdAttr form-control input-sm" data-l1key="name">';
    tr += '</div>';
    tr += '</div>';
    tr += '<select class="cmdAttr form-control input-sm" data-l1key="value" style="display : none;margin-top : 5px;" title="La valeur de la commande vaut par défaut la commande">';
    tr += '<option value="">Aucune</option>';
    tr += '</select>';
    tr += '</td>';
    tr += '<td>';
    tr += '<input class="cmdAttr form-control input-sm" data-l1key="id" style="display : none;">';
    tr += '<span class="type" type="' + init(_cmd.type) + '">' + jeedom.cmd.availableType() + '</span>';
    tr += '<span class="subType" subType="' + init(_cmd.subType) + '"></span>';
    tr += '</td>';
    tr += '<td><input class="cmdAttr form-control input-sm" data-l1key="configuration" data-l2key="logicalid" value="0" style="width : 70%; display : inline-block;" placeholder="{{Commande}}"><br/>';
    
    tr += '<input class="cmdAttr form-control input-sm" data-l1key="configuration" data-l2key="returnStateValue" placeholder="{{Valeur retour d\'état}}" style="width : 20%; display : inline-block;margin-top : 5px;margin-right : 5px;">';
    tr += '<input class="cmdAttr form-control input-sm" data-l1key="configuration" data-l2key="returnStateTime" placeholder="{{Durée avant retour d\'état (min)}}" style="width : 20%; display : inline-block;margin-top : 5px;margin-right : 5px;">';
    tr += '</td>';
    tr += '<td>';
    tr += '<span><label class="checkbox-inline"><input type="checkbox" class="cmdAttr checkbox-inline" data-l1key="isVisible" checked/>{{Afficher}}</label></span> ';
    tr += '<span><label class="checkbox-inline"><input type="checkbox" class="cmdAttr checkbox-inline" data-l1key="isHistorized" checked/>{{Historiser}}</label></span> ';
    tr += '<span><label class="checkbox-inline"><input type="checkbox" class="cmdAttr" data-l1key="display" data-l2key="invertBinary"/>{{Inverser}}</label></span> ';
    tr += '</td>';
    tr += '<td>';
    tr += '<select class="cmdAttr form-control input-sm" data-l1key="configuration" data-l2key="updateCmdId" style="display : none;margin-top : 5px;" title="Commande d\'information à mettre à jour">';
    tr += '<option value="">Aucune</option>';
    tr += '</select>';
    tr += '<input class="cmdAttr form-control input-sm" data-l1key="configuration" data-l2key="updateCmdToValue" placeholder="Valeur de l\'information" style="display : none;margin-top : 5px;">';
    tr += '<input class="cmdAttr form-control input-sm" data-l1key="unite"  style="width : 100px;" placeholder="Unité" title="Unité">';
    tr += '<input class="cmdAttr form-control input-sm" data-l1key="configuration" data-l2key="minValue" placeholder="Min" title="Min"> ';
    tr += '<input class="cmdAttr form-control input-sm" data-l1key="configuration" data-l2key="maxValue" placeholder="Max" title="Max" style="margin-top : 5px;">';
    tr += '</td>';
    tr += '<td>';
    if (is_numeric(_cmd.id)) {
        tr += '<a class="btn btn-default btn-xs cmdAction" data-action="configure"><i class="fa fa-cogs"></i></a> ';
        tr += '<a class="btn btn-default btn-xs cmdAction" data-action="test"><i class="fa fa-rss"></i> Tester</a>';
    }
    tr += '<i class="fa fa-minus-circle pull-right cmdAction cursor" data-action="remove"></i></td>';
    tr += '</tr>';
    $('#table_cmd tbody').append(tr);
    var tr = $('#table_cmd tbody tr:last');
    jeedom.eqLogic.builSelectCmd({
        id: $('.eqLogicAttr[data-l1key=id]').value(),
        filter: {type: 'info'},
        error: function (error) {
            $('#div_alert').showAlert({message: error.message, level: 'danger'});
        },
        success: function (result) {
            tr.find('.cmdAttr[data-l1key=value]').append(result);
            tr.find('.cmdAttr[data-l1key=configuration][data-l2key=updateCmdId]').append(result);
            tr.setValues(_cmd, '.cmdAttr');
            jeedom.cmd.changeType(tr, init(_cmd.subType));
        }
    });
}

$('body').on('broadlink::includeState', function (_event,_options) {
	if (_options['state'] == 1) {
		if($('.include').attr('data-state') != 0){
			$.hideAlert();
			$('.include').attr('data-state', 0);
			$('.include.card span').text('{{Arrêter l\'inclusion}}');
			$('#div_inclusionAlert').showAlert({message: '{{Vous etes en mode inclusion. Recliquez sur le bouton d\'inclusion pour sortir de ce mode. Sinon attendre que le scan de 5 secondes se termine.}}', level: 'warning'});
		}
	} else {
		if($('.include').attr('data-state') != 1){
			$.hideAlert();
			$('.include').attr('data-state', 1);
			$('.include.card span').text('{{Mode inclusion}}');
		}
	}
});

$('body').on('broadlink::includeDevice', function (_event,_options) {
    if (modifyWithoutSave) {
        $('#div_inclusionAlert').showAlert({message: '{{Un périphérique vient d\'être inclu/exclu. Veuillez réactualiser la page}}', level: 'warning'});
    } else {
        if (_options == '') {
            window.location.reload();
        } else {
            window.location.href = 'index.php?v=d&p=broadlink&m=broadlink&id=' + _options;
        }
    }
});

$('body').on('broadlink::includeCommand', function (_event,_options) {
    $('#div_inclusionAlert').showAlert({message: '{{Une nouvelle commande vient d\'être ajoutée. Pensez à lui donner un nom.}}', level: 'success'});
    window.location.href = 'index.php?v=d&p=broadlink&m=broadlink&id=' + _options+'&nocache=' + (new Date()).getTime() +'#commandtab';
});

$('body').on('broadlink::missedCommand', function (_event,_options) {
    $('#div_inclusionAlert').showAlert({message: '{{Aucune commande reçue dans le temps imparti}}', level: 'danger'});
});

$('body').on('broadlink::foundfrequency', function (_event,_options) {
	if (_options['state'] == 1) {
		$('#div_inclusionAlert').showAlert({message: '{{Fréquence RF trouvée, vous pouvez lachez le bouton et vous préparer a appuyer dans 3 secondes}}', level: 'warning'});
	} else {
		$('#div_inclusionAlert').showAlert({message: '{{Aucune Fréquence RF trouvée}}', level: 'danger'});
	}
});

$('body').on('broadlink::step2', function (_event,_options) {
	$('#div_inclusionAlert').showAlert({message: '{{Etape 2, appuyez sur le bouton}}', level: 'warning'});
});


function changeIncludeState(_state) {
    $.ajax({// fonction permettant de faire de l'ajax
        type: "POST", // methode de transmission des données au fichier php
        url: "plugins/broadlink/core/ajax/broadlink.ajax.php", // url du fichier php
        data: {
            action: "changeIncludeState",
            state: _state,
        },
        dataType: 'json',
        error: function (request, status, error) {
            handleAjaxError(request, status, error);
        },
        success: function (data) { // si l'appel a bien fonctionné
        if (data.state != 'ok') {
            $('#div_alert').showAlert({message: data.result, level: 'danger'});
            return;
        }
    }
});
}

$('.learnCommand').on('click', function () {
	$('#div_inclusionAlert').showAlert({message: '{{Veuillez appuyer sur le bouton de votre télécommande}}', level: 'warning'});
	$.ajax({// fonction permettant de faire de l'ajax
        type: "POST", // methode de transmission des données au fichier php
        url: "plugins/broadlink/core/ajax/broadlink.ajax.php", // url du fichier php
        data: {
            action: "learn",
			id : $('.eqLogicAttr[data-l1key=id]').value(),
			mode : 'normal',
        },
        dataType: 'json',
        error: function (request, status, error) {
            handleAjaxError(request, status, error);
        },
        success: function (data) { // si l'appel a bien fonctionné
        if (data.state != 'ok') {
            $('#div_alert').showAlert({message: data.result, level: 'danger'});
            return;
        }
    }
	});
});

$('.learnCommandRF').on('click', function () {
	$('#div_inclusionAlert').showAlert({message: '{{Veuillez maintenir appuyé le bouton de votre télécommande (ou appuyez successivement dessus) pour trouver la fréquence RF}}', level: 'warning'});
	$.ajax({// fonction permettant de faire de l'ajax
        type: "POST", // methode de transmission des données au fichier php
        url: "plugins/broadlink/core/ajax/broadlink.ajax.php", // url du fichier php
        data: {
            action: "learn",
			id : $('.eqLogicAttr[data-l1key=id]').value(),
			mode : 'rf',
        },
        dataType: 'json',
        error: function (request, status, error) {
            handleAjaxError(request, status, error);
        },
        success: function (data) { // si l'appel a bien fonctionné
        if (data.state != 'ok') {
            $('#div_alert').showAlert({message: data.result, level: 'danger'});
            return;
        }
    }
	});
});
