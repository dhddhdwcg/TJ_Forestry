import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { AppState } from '../../../services/app.service';
import { MissionService } from '../../../services/mission.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.less']
})
export class ModalComponent implements OnInit {

  // 开启鼠标捕捉功能
  private capture: boolean = false;

  // 鼠标按下的位置
  private downPostion: any = {};

  // 弹窗的偏移量
  private offset: any = {
    x: 0,
    y: 0
	};
	
	// 地图页面的layout dom
	private mapLayout: ElementRef;
  
  @ViewChild('modal') 
	private modal: ElementRef;
	
	// 弹窗标题
	public title: any = {
		point: '点',
		line: '线',
		polygon: '面',
	}

	@Input()
	set layout(layout: any) {
		if (!this.mapLayout) {
			this.mapLayout = layout.elementRef;
			this.mapLayout.nativeElement.addEventListener('mousemove', (event: any) => {
				this.handleMousemove(event);
			})
		}
	}

  constructor(
		public appState: AppState,
		private missionService: MissionService
	) {

	}

  ngOnInit() {
    window.addEventListener('mouseup', () => {
			if (this.appState.get('addObject')) {
				this.handleMouseup();
			}
		})
	}

	/**
   * 弹窗标题栏，鼠标按下事件
   * @param {event} event 
   */
  public modalMousedown(event: any) {
    this.capture = true;
    this.downPostion = {
      x: event.clientX,
      y: event.clientY
    }
  }

  /**
   * 鼠标移动事件
   * @param {event} event 
   */
  private handleMousemove(event: any) {
    if (this.capture) {
      this.offset = {
        x: event.clientX - this.downPostion.x,
        y: event.clientY - this.downPostion.y
      };
    }
  }

  /**
   * 鼠标按键抬起事件
   */
  private handleMouseup() {
    this.capture = false;
    let _sX = this.modal.nativeElement.offsetLeft + this.offset.x;
    if (_sX < 10) {
      _sX = 10;
    }
    if (_sX +  this.modal.nativeElement.offsetWidth > document.body.offsetWidth - 10) {
      _sX = document.body.offsetWidth - this.modal.nativeElement.offsetWidth - 10;
    }
    let _sY = this.modal.nativeElement.offsetTop + this.offset.y;
    if (_sY < 74) {
      _sY = 74;
    }
    if (_sY + this.modal.nativeElement.offsetHeight > document.body.offsetHeight - 10) {
      _sY = document.body.offsetHeight - this.modal.nativeElement.offsetHeight - 10;
    }

    this.modal.nativeElement.style.left = _sX + 'px';
    this.modal.nativeElement.style.top = _sY + 'px';
    this.offset = {
      x: 0,
      y: 0
    };
	}

	/**
	 * 提交
	 */
	public submit() {
		this.appState.set('addObject', false);
		this.missionService.announceMission({
			type: 'addObjectSubmit',
			value: true
		});
	}

	/**
	 * 取消
	 */
	public cancel() {
		this.appState.set('addObject', false);
		this.missionService.announceMission({
			type: 'addObjectCancel',
			value: true
		});
	}
 
}
