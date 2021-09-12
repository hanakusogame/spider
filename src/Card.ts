import tl = require("@akashic-extension/akashic-timeline");
import { MainGame } from "./MainGame";
import { MainScene } from "./MainScene";

//カードクラス
export class Card extends g.E {
	public static cntAnimeCards: number = 0;
	private static doubleCard: Card; //ダブルクリック判定用
	private static tapCard: Card = null; //マルチタッチ禁止用
	public mark: number; //記号
	public num: number; //数字
	public isRed: () => boolean;
	public open: (isAnime: boolean) => void;
	public close: () => void;
	public isOpen: boolean;
	public wait: number;//移動時間をずらす処理

	constructor(maingame: MainGame, mark: number, num: number, x: number, y: number) {
		const scene = g.game.scene() as MainScene;

		super({
			scene: scene,
			x: x,
			y: y,
			width: 110,
			height: 165,
			parent: maingame,
		});

		const timeline = new tl.Timeline(scene);
		this.num = num;
		this.mark = mark;
		this.isOpen = false;
		this.wait = 0;

		const sprite = new g.FrameSprite({
			scene: scene,
			src: scene.asset.getImageById("card"),
			x: 110 / 2,
			y: 165 / 2,
			anchorX: 0.5,
			anchorY: 0.5,
			width: 110,
			height: 165,
			frames: [0, 1, 2],
			frameNumber: 1,
			parent: this,
		});

		const base = new g.E({
			scene: scene,
			parent: sprite,
		});
		base.hide();

		new g.Sprite({
			scene: scene,
			src: scene.asset.getImageById("mark"),
			x: 2,
			y: 2,
			srcX: 36 * mark,
			width: 36,
			parent: base,
		});

		new g.Sprite({
			scene: scene,
			src: scene.asset.getImageById("number2"),
			x: 36,
			y: 2,
			srcX: 36 * (num - 1),
			srcY: 45 * Math.floor(mark / 2),
			width: 36,
			height: 36,
			parent: base,
		});

		if (num <= 10) {
			new g.Sprite({
				scene: scene,
				src: scene.asset.getImageById("mark2"),
				x: 10,
				y: 60,
				srcX: 90 * mark,
				width: 90,
				height: 90,
				parent: base,
			});
		} else {
			new g.Sprite({
				scene: scene,
				src: scene.asset.getImageById("mark3"),
				x: 0,
				y: 45,
				srcX: 110 * (num - 11),
				width: 110,
				height: 110,
				parent: base,
			});
		}

		this.isRed = () => {
			return this.mark < 2;
		};

		this.open = (isAnime) => {
			if (this.isOpen) return;
			sprite.frameNumber = 0;
			base.show();
			this.isOpen = true;
			if (isAnime) {
				timeline.create(sprite).scaleTo(0, 1, 200).scaleTo(1, 1, 200);
			}
		};

		this.close = () => {
			sprite.frameNumber = 1;
			base.hide();
			this.isOpen = false;
		};
	}
}
