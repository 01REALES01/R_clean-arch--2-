import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MovieHttpModule } from './presentation/module/movie.module';
import { DirectorHttpModule } from './presentation/module/director.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MovieHttpModule,
    DirectorHttpModule,
  ],
})
export class AppModule {}
