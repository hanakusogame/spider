import tl = require("@akashic-extension/akashic-timeline");
//import { Card } from "./Card";
import { CardArea } from "./CardArea";
import { MainGame } from "./MainGame";
import { MainScene } from "./MainScene";

//カード置き場クラス(場)
export class Cascade extends CardArea {
	public sortCards: () => void;
	public getCompCardPos: () => number;
	constructor(maingame: MainGame, x: number, y: number) {
		super(maingame, x, y);
		const scene = g.game.scene() as MainScene;
		const timeline = new tl.Timeline(scene);

		this.collisionArea = new g.FilledRect({
			scene: scene,
			width: 5,
			height: 720,
			x: (this.width - 5) / 2 + this.x,
			y: 0,
			cssColor: "yellow",
			opacity: 0.0,
			parent: maingame,
		});

		//カードを重ねられるかどうか
		this.isAddCards = (cards) => {
			if (!this.list.length) {
				return true;
			} else {
				const lastCard = this.list.slice(-1)[0];
				const card = cards[0];
				if (card.num + 1 === lastCard.num) {
					return true;
				}
			}
			return false;
		};

		//位置を並べなおす
		this.sortCards = () => {
			const numOpen = this.list.filter((c) => c.isOpen).length;
			const numClose = this.list.length - numOpen;

			const openY = Math.min(50, (740 - numClose * 10 - (this.height - this.y)) / numOpen);
			const colseY = 10;
			let y = this.y;
			for (let i = 0; i < this.list.length; i++) {
				const c = this.list[i];
				const prevC = i === 0 ? null : this.list[i - 1];
				const shiftY = prevC && prevC.isOpen ? openY : colseY;
				const x = this.x;
				if (prevC) y += shiftY;
				if (x !== c.x || y !== c.y) {
					timeline.create(c).moveTo(x, y, 200);
				}
				maingame.append(c);
			}
		};

		//座標からカードを取得する
		this.getCards = (x, y) => {
			for (let i = this.list.length - 1; i >= 0; i--) {
				const c = this.list[i];
				if (!c.isOpen) return;
				if (i === this.list.length - 1 || c.num === this.list[i + 1].num + 1) {
					if (g.Collision.intersect(x, y, 0, 0, c.x, c.y, c.width, c.height)) {
						return { num: i, cards: this.list.slice(i) };
					}
				} else {
					return null;
				}
			}
			return null;
		};

		//揃っている位置の取得
		this.getCompCardPos = () => {
			let num = 0;
			for (let i = this.list.length - 1; i >= 0; i--) {
				const c = this.list[i];
				if (c.num === num + 1 && c.isOpen) {
					num++;
				} else {
					break;
				}
			}
			if (num === 13) {
				return this.list.length - num;
			} else {
				return -1;
			}
		};

		//スコアを算出
		this.getScore = () => {
			if (!this.list.length) return 0;
			let cnt = 0;
			for (let i = this.list.length - 1; i >= 0; i--) {
				const nowC = this.list[i];
				if (!nowC.isOpen) break;
				if (i !== 0) {
					const prevC = this.list[i - 1];
					if (prevC.isOpen && nowC.num === prevC.num - 1) {
						cnt++;
					} else {
						break;
					}
				}
			}
			return cnt ** 2 * 100;
		};
	}
}
