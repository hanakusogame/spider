//import tl = require("@akashic-extension/akashic-timeline");
import { Card } from "./Card";
import { MainGame } from "./MainGame";
import { MainScene } from "./MainScene";

//カード置き場クラス
export abstract class CardArea extends g.Sprite {
	public list: Card[];
	public isAddCards: (cards: Card[]) => boolean;
	public addCards: (cards: Card[]) => void;
	public getCards: (x: number, y: number) => { num: number; cards: Card[] };
	public cutCards: (num: number) => void;
	public sortCards: () => void;
	public getScore: () => number;
	public collisionArea: g.FilledRect;

	constructor(maingame: MainGame, x: number, y: number) {
		const scene = g.game.scene() as MainScene;

		super({
			scene: scene,
			src: scene.asset.getImageById("card"),
			x: x,
			y: y,
			width: 110,
			height: 165,
			srcX: 110 * 2,
			parent: maingame,
		});

		this.list = [];

		//カードを重ねる
		this.addCards = (cards) => {
			this.list = this.list.concat(cards);
		};

		//カードを取得する
		this.cutCards = (num) => {
			this.list = this.list.slice(0, num);
		};

		//スコアを算出
		this.getScore = () =>{
			return 0;
		};
	}
}
