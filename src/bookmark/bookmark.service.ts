import { EditBookmarkDto } from './dto/edit-bookmark.dto';
import { PrismaService } from '../prisma/prisma.service';
import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { createBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async createBookmark(
    userId: number,
    dto: createBookmarkDto,
  ) {
    const bookmark = await this.prisma.bookmark.create({
      data: {
        userId,
        ...dto,
      },
    });
    if (bookmark) {
      return bookmark;
    }
    throw new Error('Bookmark not created');
  }

  getBookmarks(userId: number) {
    return this.prisma.bookmark.findMany({
      where: {
        userId,
      },
    });
  }

  getBookmarkById(userId: number, bookmarkId: number) {
    return this.prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId,
      },
    });
  }

  async editBookmarkById(
    userId: number,
    bookmarkId: number,
    dto: EditBookmarkDto,
  ) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    if (!bookmark || bookmark.userId !== userId)
      throw new ForbiddenException(
        'Access to resources denied',
      );

    return this.prisma.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteBookmark(userId: number, bookmarkId: number) {
    const bookmarkToDelete =
      await this.prisma.bookmark.findUnique({
        where: {
          id: bookmarkId,
        },
      });
    if (
      bookmarkToDelete ||
      bookmarkToDelete.userId === userId
    ) {
      return this.prisma.bookmark.delete({
        where: {
          id: bookmarkId,
        },
      });
    }

    throw new ForbiddenException(
      'Access to resources denied',
    );
  }
}
