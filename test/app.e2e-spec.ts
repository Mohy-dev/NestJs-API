import { AuthDto } from './../src/auth/dto/auth.dto';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from './../src/app.module';
import { Test } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as pactum from 'pactum';
describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true }),
    );

    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });
  afterAll(async () => {
    await app.close();
  });

  const dto: AuthDto = {
    email: 'test@test.com',
    password: 'test',
  };

  describe('Auth', () => {
    const emptyFieldsTest = (opt) => {
      it('should throw if email is empty', () => {
        pactum
          .spec()
          .post(`/auth/${opt}`)
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('should throw if password is empty', () => {
        pactum
          .spec()
          .post(`/auth/${opt}`)
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('should throw if body is empty', () => {
        pactum
          .spec()
          .post(`/auth/${opt}`)
          .expectStatus(400);
      });
    };

    describe('signUp', () => {
      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201)
          .stores('userId', 'id');
      });
    });

    emptyFieldsTest('signup');

    describe('signIn', () => {
      it('should sigin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('token', 'access_token');
      });
      emptyFieldsTest('signin');
    });
  });
  describe('User', () => {
    it('should get user', () => {
      return pactum
        .spec()
        .get('/users/me')
        .withHeaders({
          Authorization: 'Bearer $S{token}',
        })
        .expectStatus(200);
    });

    it('should edit user', () => {
      return pactum
        .spec()
        .patch('/users')
        .withHeaders({
          Authorization: 'Bearer $S{token}',
        })
        .withBody({
          email: dto.email,
          firstName: 'test',
          lastName: 'test',
        })
        .expectStatus(200)
        .expectBodyContains(dto.email)
        .expectBodyContains('test');
    });
  });

  describe('Bookmarks', () => {
    it('should create bookmark', () => {
      return pactum
        .spec()
        .post('/bookmark')
        .withHeaders({
          Authorization: 'Bearer $S{token}',
        })
        .withBody({
          link: 'test',
          title: 'test',
        })
        .expectStatus(201)
        .expectBodyContains('test')
        .expectBodyContains('test')
        .stores('bookmarkId', 'id');
    });

    it('should get bookmarks', () => {
      return pactum
        .spec()
        .get('/bookmark')
        .withHeaders({
          Authorization: 'Bearer $S{token}',
        })
        .expectStatus(200);
    });

    describe('Get Bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmark/$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .expectStatus(200);
      });
    });

    describe('Edit Bookmark', () => {
      it('should edit bookmark', () => {
        return pactum
          .spec()
          .patch('/bookmark/$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .withBody({
            link: 'test',
            title: 'test',
          })
          .expectStatus(200)
          .expectBodyContains('test')
          .expectBodyContains('test');
      });
    });
    describe('Delete Bookmark', () => {
      it('should delete bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmark/$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{token}',
          })
          .expectStatus(204);
      });
    });
  });
});
