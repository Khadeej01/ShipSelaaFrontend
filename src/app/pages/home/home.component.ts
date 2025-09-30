import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  features = [
    {
      title: 'Delivery Management',
      description: 'Efficiently manage all your delivery requests from creation to completion.',
      icon: '📦'
    },
    {
      title: 'Driver Assignment',
      description: 'Automatically assign available drivers to delivery requests.',
      icon: '🚚'
    },
    {
      title: 'Real-time Tracking',
      description: 'Track delivery status and progress in real-time.',
      icon: '📍'
    },
    {
      title: 'Manager Dashboard',
      description: 'Comprehensive dashboard for managers to oversee operations.',
      icon: '📊'
    }
  ];

  stats = [
    { label: 'Active Deliveries', value: '150+' },
    { label: 'Available Drivers', value: '25+' },
    { label: 'Satisfied Customers', value: '1000+' },
    { label: 'Cities Covered', value: '15+' }
  ];
}