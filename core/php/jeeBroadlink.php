<?php

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
require_once dirname(__FILE__) . "/../../../../core/php/core.inc.php";

if (!jeedom::apiAccess(init('apikey'), 'broadlink')) {
	echo 'Clef API non valide, vous n\'etes pas autorisé à effectuer cette action';
	die();
}

if (init('test') != '') {
	echo 'OK';
	die();
}
$result = json_decode(file_get_contents("php://input"), true);
if (!is_array($result)) {
	die();
}

log::add('broadlink', 'debug','[PHP] jeeBroadlink POST result: ' . json_encode($result));
// [2021-01-23 22:18:04][DEBUG] : [PHP] jeeBroadlink POST result: {"devices":{"24dfa74f87b2":{"mac":"24dfa74f87b2","temperature":0,"humidity":0},"a043b0b24bd3":"{'red': 255, 'blue': 255, 'green': 255, 'pwr': 1, 'brightness': 42, 'colortemp': 2700, 'hue': 0, 'saturation': 0, 'transitionduration': 1500, 'maxworktime': 0, 'bulb_colormode': 1, 'bulb_scenes': '[\"@01686464,0,0,0\", \"#ffffff,10,0,#000000,190,0,0\", \"2700+100,0,0,0\", \"#ff0000,500,2500,#00FF00,500,2500,#0000FF,500,2500,0\", \"@01686464,100,2400,@01686401,100,2400,0\", \"@01686464,100,2400,@01686401,100,2400,@005a6464,100,2400,@005a6401,100,2400,0\", \"@01686464,10,0,@00000000,190,0,0\", \"@01686464,200,0,@005a6464,200,0,0\", \"#000000,1000,0,#0080FF,1000,5000,0\", \"#000000,1000,0,#00FF00,1,3000,0\", \"#0000FF,1000,1000,#00FF00,1000,1000,#000000,1,1000,#FF0000,0,0,0\"]', 'bulb_scene': '#0000FF,1000,1000,#00FF00,1000,1000,#000000,1,1000,#FF0000,0,0,0', 'bulb_sceneidx': 255}"}}

if (isset($result['learn_mode'])) {
	if ($result['learn_mode'] == 1) {
		config::save('include_mode', 1, 'broadlink');
		event::add('broadlink::includeState', array(
			'state' => 1)
		);
	} else {
		config::save('include_mode', 0, 'broadlink');
		event::add('broadlink::includeState', array(
			'state' => 0)
		);
	}
	die();
}
if (isset($result['foundfrequency'])) {
	if ($result['foundfrequency'] == 1) {
		event::add('broadlink::foundfrequency', array(
			'state' => 1)
		);
	} else {
		event::add('broadlink::foundfrequency', array(
			'state' => 0)
		);
	}
	die();
}
if (isset($result['step2'])) {
	event::add('broadlink::step2', array(
			'state' => 1)
		);
	die();
}
if (isset($result['devices'])) {
	foreach ($result['devices'] as $key => $datas) {
		if (!isset($datas['mac'])) {
			continue;
		}
		$logicalId = $key;
		$broadlink = broadlink::byLogicalId($logicalId, 'broadlink');
		if (isset($datas['reversemac'])){
			$broadlink2 = broadlink::byLogicalId($datas['reversemac'], 'broadlink');
			if (!is_object($broadlink) && is_object($broadlink2)) {
				$broadlink = $broadlink2;
			}
		}
		if (!is_object($broadlink)) {
			if ($datas['learn'] != 1) {
				continue;
			}
			$broadlink = broadlink::createFromDef($datas);
			if (!is_object($broadlink)) {
				log::add('broadlink', 'debug', __('Aucun équipement trouvé pour : ', __FILE__) . secureXSS($datas['id']));
				continue;
			}
			event::add('jeedom::alert', array(
				'level' => 'warning',
				'page' => 'broadlink',
				'message' => '',
			));
			event::add('broadlink::includeDevice', $broadlink->getId());
		}
		if (!$broadlink->getIsEnable()) {
			continue;
		}
		if (isset($datas['learnedCmd']) && $datas['learnedCmd'] == 1) {
			if ($datas['hexcode'] == 'no'){
				event::add('broadlink::missedCommand', $broadlink->getId());
				continue;
			}
			$number = count($broadlink->getCmd())+1;
			$cmd = $broadlink->getCmd(null, $number.substr($datas['hexcode'],0,50));
			if (!is_object($cmd)) {
				$cmd = new broadlinkCmd();
				$cmd->setLogicalId($number.substr($datas['hexcode'],0,50));
				$cmd->setIsVisible(1);
				$cmd->setName($number .__('Commande', __FILE__) . substr($datas['hexcode'],0,10));
			}
			$cmd->setType('action');
			$cmd->setSubType('other');
			$cmd->setconfiguration('logicalid','hex2send:' . $datas['hexcode']);
			$cmd->setEqLogic_id($broadlink->getId());
			$cmd->save();
			event::add('broadlink::includeCommand', $broadlink->getId());
			continue;
		}
		log::add('broadlink', 'debug','[PHP] datas: ' . json_encode($datas));

		foreach ($broadlink->getCmd('info') as $cmd) {
			$logicalId = $cmd->getConfiguration('logicalid');
			log::add('broadlink', 'debug','[PHP] cmd');

			if ($logicalId == '') {
				continue;
			}
			log::add('broadlink', 'debug','[PHP] logicalId: ' . $logicalId);

			$path = explode('::', $logicalId);
			$value = $datas;

			foreach ($path as $key) {

				if (!isset($value[$key])) {
					continue (2);
				}
				log::add('broadlink', 'debug','[PHP] key :'.$key." => " .$value[$key]);

				$value = $value[$key];
				if (!is_array($value) && strpos($value, 'toggle') !== false && $cmd->getSubType() == 'binary') {
					$value = $cmd->execCmd();
					$value = ($value != 0) ? 0 : 1;
				}
				if ($key == 'battery') {
					log::add('broadlink','debug',$value);
					$value = ($value != 0) ? 0 : 100;
					$broadlink->batteryStatus($value);
				}


			}
			if (!is_array($value)) {
				$cmd->event($value);
			}
		}
	}
}
