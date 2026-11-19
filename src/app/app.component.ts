import { Component, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <main>
      <h1>Hello, World!</h1>
      <p>Angular front end, served by Express, running on Chainguard images.</p>
      <p class="api">API says: <strong>{{ message() }}</strong></p>
    </main>
  `,
})
export class AppComponent implements OnInit {
  readonly message = signal('loading…');

  async ngOnInit(): Promise<void> {
    try {
      const res = await fetch('/api/hello');
      const body = (await res.json()) as { message: string; node: string };
      this.message.set(`${body.message} (Node ${body.node})`);
    } catch {
      this.message.set('backend unreachable');
    }
  }
}
