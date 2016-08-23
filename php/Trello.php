<?php
class Client {
	const Trello_endpoint = "https://api.trello.com";
	private $key;
	private $token;

	public function getAuthorisation($api_key, $token) {
		$this->set_api_key($api_key);
		$this->set_token($token);
		$user = $this->trelloGet('/1/members/me');
		if (!isset($user)) {
			return false;
		}
		echo $user;
		return true;
	}

	public function getCards($api_key, $token) {
		$this->set_api_key($api_key);
		$this->set_token($token);
		$cards = $this->trelloGet('/1/members/me/cards');
		if (!isset($cards)) {
			return false;
		}
		echo $cards;
		return $cards;
	}

	public function getBoardName($api_key, $token, $board_id) {
		$this->set_api_key($api_key);
		$this->set_token($token);
		$board = $this->trelloGet('/1/boards/' . $board_id);
		if (!isset($board)) {
			return false;
		}
		echo $board;
		return $board;
	}

	private function trelloGet($uri) {
		$query = array(
			'key' => $this->get_api_key(),
			'token' => $this->get_token()
		);
		$url = self::Trello_endpoint . $uri . '?' . http_build_query($query);
		$json = file_get_contents($url);
		return $json;
	}

	public function set_api_key($key) {
		$this->key = $key;
	}

	public function get_api_key() {
		return $this->key;
	}

	public function set_token($token) {
		$this->token = $token;
	}

	public function get_token() {
		return $this->token;
	}
}

if (isset($_GET['action']) && isset($_GET['key']) && isset($_GET['token'])) {
	if ( $_GET['action'] == 'authorize' ) {
		$client = new Client();
		$client->getAuthorisation( $_GET['key'], $_GET['token'] );
	}

	if ( $_GET['action'] == 'getCards' ) {
		$client = new Client();
		$client->getCards( $_GET['key'], $_GET['token'] );
	}

	if ( $_GET['action'] == 'getBoardName' && $_GET['board_id']) {
		$client = new Client();
		$client->getBoardName( $_GET['key'], $_GET['token'], $_GET['board_id'] );
	}
}else {
	echo 'not all the neccesery stuff is provided.';
	var_dump($_GET);
}
?>
