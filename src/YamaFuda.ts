//import { Card } from "./Card";
import { CardArea } from "./CardArea";
import { MainGame } from "./MainGame";

//カード置き場クラス(山札)
export class YamaFuda extends CardArea {
	public sortCards: () => void;
	constructor(maingame: MainGame, x: number, y: number) {
		super(maingame, x, y);
		// const scene = g.game.scene() as MainScene;
		this.touchable = true;

		// 位置を並べなおす
		this.sortCards = () => {
			for (let i = 0; i < this.list.length; i++) {
				const c = this.list[i];
				c.x = this.x;
				c.y = this.y - (Math.floor(i / 10)) * 10;
				c.modified();
				maingame.append(c);
			}
		};
	}
}
