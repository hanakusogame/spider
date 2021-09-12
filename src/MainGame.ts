import tl = require("@akashic-extension/akashic-timeline");
import { Card } from "./Card";
import { CardArea } from "./CardArea";
import { Cascade } from "./Cascade";
import { KumiFuda } from "./KumiFuda";
import { MainScene } from "./MainScene";
import { YamaFuda } from "./YamaFuda";

//ゲームクラス
export class MainGame extends g.E {
	constructor() {
		const scene = g.game.scene() as MainScene;
		super({ scene: scene, width: g.game.width, height: g.game.height, touchable: true });
		const timeline = new tl.Timeline(scene);
		let isDoubleNum: number = -1; //ダブルクリックフラグ

		// 山札置き場
		const yArea = new YamaFuda(this, 1170, 550);

		// 組札置き場
		const kAreas: KumiFuda[] = [];
		for (let i = 0; i < 8; i++) {
			const kArea = new KumiFuda(this, 1170, 40 * i + 100);
			kAreas.push(kArea);
		}

		// 場札置き場
		const areas: Cascade[] = [];
		for (let i = 0; i < 10; i++) {
			const area = new Cascade(this, 115 * i + 20, 10);
			this.append(area);
			areas.push(area);
		}

		// カード作成
		const cards: Card[] = [];
		for (let i = 0; i < 8; i++) {
			for (let j = 1; j <= 13; j++) {
				const c = new Card(this, 3, j, 0, 0);
				cards.push(c);
			}
		}

		//シャッフル
		for (let i = cards.length - 1; i >= 0; i--) {
			const j = Math.floor(g.game.random.generate() * (i + 1));
			[cards[i], cards[j]] = [cards[j], cards[i]];
		}

		//山札にセット
		yArea.addCards(cards);
		yArea.sortCards();

		//移動(表示は更新しない)
		const stack: { srcArea: CardArea; dstArea: CardArea; num: number }[] = [];
		const move = (srcArea: CardArea, dstArea: CardArea, num: number): void => {
			const p = dstArea.list.length;
			dstArea.addCards(srcArea.list.slice(num));
			srcArea.cutCards(num);
			stack.push({ srcArea: dstArea, dstArea: srcArea, num: p });
		};

		//配る
		while (yArea.list.length > 104 - 54) {
			areas.forEach((area, i) => {
				if (!(yArea.list.length > 104 - 54)) return;
				move(yArea, area, yArea.list.length - 1);
			});
		}

		//ソート
		areas.forEach((area, i) => {
			area.sortCards();
			area.list.slice(-1)[0].open(true);
		});

		//山札に配る
		yArea.onPointUp.add(() => {
			//空白の列を避ける
			if (areas.some((area) => area.list.length === 0)) {
				scene.playSound("se_miss");
				return;
			}

			//各列に配る
			areas.forEach((area) => {
				if (!yArea.list.length) return;
				move(yArea, area, yArea.list.length - 1);
				area.list.slice(-1)[0].open(true);
				area.sortCards();
			});

			scene.playSound("se_move");
			setScore();
			gameClear();

			timeline
				.create(this)
				.wait(200)
				.call(() => {
					if (autoMove()) {
						setScore();
						gameClear();
					}
				});
		});

		//そろっているかどうかの確認と移動
		let compCnt = 0;
		const autoMove = (): boolean => {
			for (let i = 0; i < areas.length; i++) {
				const area = areas[i];
				const num = area.getCompCardPos();
				if (num !== -1) {
					move(area, kAreas[compCnt], num);
					if (area.list.length) {
						timeline
							.create(this)
							.wait(1300)
							.call(() => {
								area.sortCards();
								area.list.slice(-1)[0].open(true);
							});
					}
					kAreas[compCnt].sortCards();
					compCnt++;
					return true;
				}
			}
			return false;
		};

		//スコア集計
		const setScore = (): void => {
			let score = 0;
			areas.forEach((area) => {
				score += area.getScore();
			});
			score += 13 ** 2 * compCnt * 100;
			scene.addScore(score - g.game.vars.gameState.score);
		};

		//クリア判定とクリア処理
		const gameClear = (): void => {
			if (compCnt < 8) return;
			//クリア処理
			scene.playSound("se_clear");
			scene.isClear = true;
		};

		//移動処理まとめ
		const moveSub = (srcArea: Cascade, dstArea: Cascade, cardsNum: number): void => {
			move(srcArea, dstArea, cardsNum);
			srcArea.sortCards();
			dstArea.sortCards();
			if (srcArea.list.length) srcArea.list.slice(-1)[0].open(true);
			setScore();
			gameClear();

			timeline
				.create(this)
				.wait(200)
				.call(() => {
					if (autoMove()) {
						setScore();
						gameClear();
					}
				});
			scene.playSound("se_move");
		};

		this.onUpdate.add(() => {
			if (isDoubleNum !== -1) isDoubleNum++;
		});

		// 押す
		let bkCards: { num: number; cards: Card[] } = null;
		let bkArea: Cascade = null;
		this.onPointDown.add((ev) => {
			if (!scene.isStart) return;
			bkCards = null;
			bkArea = null;

			if (isDoubleNum > 2 && isDoubleNum < 15) {
				for (let i = 0; i < areas.length; i++) {
					const srcArea = areas[i];
					const cards = srcArea.getCards(ev.point.x, ev.point.y);
					if (!cards) continue;
					let flg = false;
					for (let j = 0; j < areas.length - 1; j++) {
						const dstArea = areas[(i + j + 1) % areas.length];
						if (dstArea.isAddCards(cards.cards)) {
							moveSub(srcArea, dstArea, cards.num);
							flg = true;
							break;
						}
					}
					if (flg) break;
				}
				isDoubleNum = -1;
				return;
			}

			for (let i = 0; i < areas.length; i++) {
				const area = areas[i];
				bkCards = area.getCards(ev.point.x, ev.point.y);
				if (bkCards) {
					bkArea = area;
					bkCards.cards.forEach((card) => this.append(card)); //手前に
					break;
				}
			}

			isDoubleNum = 0;

			// scene.setTimeout(() => {
			// 	isDoubleClick = false;
			// }, 500);
		});

		// マウス移動
		this.onPointMove.add((ev) => {
			if (!scene.isStart) return;
			if (!bkCards) return;
			bkCards.cards.forEach((card) => {
				card.x += ev.prevDelta.x;
				card.y += ev.prevDelta.y;
				card.modified();
			});
		});

		// 離す
		this.onPointUp.add((ev) => {
			if (!bkCards) return;
			if (!scene.isStart) {
				bkArea.sortCards();
				return;
			}

			let isMove = false;
			for (let i = 0; i < areas.length; i++) {
				const area = areas[i];
				if (area === bkArea) continue;
				if (g.Collision.intersectAreas(area.collisionArea, bkCards.cards[0])) {
					const nums = [0, -1, +1]; //左右に補正
					for (let j = 0; j < 3; j++) {
						const num = i + nums[j];
						if (num < 0 || num >= areas.length) continue;
						const a = areas[num];
						if (a.isAddCards(bkCards.cards)) {
							moveSub(bkArea, a, bkCards.num);
							isMove = true;
							break;
						}
					}
					break;
				}
			}
			if (!isMove) {
				scene.playSound("se_miss");
				bkArea.sortCards();
			}
		});

		scene.setTimeout(() => {
			setScore();
		}, 200);
	}
}
