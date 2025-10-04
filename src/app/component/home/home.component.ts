import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { VavbarComponent } from '../navbar/vavbar.component';
import { AuthServiceService } from '../../services/auth-service';

@Component({
  selector: 'app-home',
  imports: [VavbarComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  token = localStorage.getItem('token');

  constructor( private auth: AuthServiceService) { }

  ngOnInit(): void {
    console.log(this.auth.getDecodedToken(this.token));
  }


}
