import { Component } from '@angular/core';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms'
@Component({
  selector: 'app-home',
  imports: [FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  roomId="";
  constructor(private router:Router){

  }
    joinRoom(){
    if(!this.roomId.trim())return;
    this.router.navigate(['/editor'],{queryParams:{room:this.roomId}})
    }
}

