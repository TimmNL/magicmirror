<?php
class Client {
	const Trello_endpoint = "https://api.trello.com";
	private $key;
	private $token;

	public function __construct($key, $token) {
		$this->key = $key;
		$this->token = $token;
	}

	public function getAuthorisation() {
		$user = $this->trelloGet('/1/members/me');
		if (!isset($user)) {
			return false;
		}
		echo $user;
		return true;
	}

	public function getCards() {
		$cards = $this->trelloGet('/1/members/me/cards');
		if (!isset($cards)) {
			return false;
		}
		echo $cards;
		return $cards;
	}

	public function getBoardName($board_id) {
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
	$client = new Client($_GET['key'], $_GET['token']);
	if ( $_GET['action'] == 'authorize' ) {
		$client->getAuthorisation();
	}

	if ( $_GET['action'] == 'getCards' ) {
		$client->getCards();
	}

	if ( $_GET['action'] == 'getBoardName' && isset($_GET['board_id'])) {
		$client->getBoardName($_GET['board_id']);
	}
}else {
	echo 'not all the neccesery stuff is provided.';
	var_dump($_GET);
}
?>
