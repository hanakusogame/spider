import tl = require("@akashic-extension/akashic-timeline");
//import { Card } from "./Card";
import { CardArea } from "./CardArea";
import { MainGame } from "./MainGame";
import { MainScene } from "./MainScene";

//カード置き場クラス(組札)
export class KumiFuda extends CardArea {
	public sortCards: () => void;
	constructor(maingame: MainGame, x: number, y: number) {
		super(maingame, x, y);
		const scene = g.game.scene() as MainScene;
		const timeline = new tl.Timeline(scene);
		this.hide();

		// 位置を並べなおす
		this.sortCards = () => {
			for (let i = 0; i < this.list.length; i++) {
				const c = this.list[i];

				timeline
					.create(c)
					.wait(100 * (this.list.length - i))
					.call(() => {
						maingame.append(c);
					})
					.moveTo(this.x, this.y, 200);
			}
		};
	}
}
