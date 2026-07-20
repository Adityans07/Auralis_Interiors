from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import BlogPost
from app.utils.responses import ApiError, success

router = APIRouter(prefix="/blogs", tags=["blogs"])


def blog_to_client(post: BlogPost) -> dict:
    return {
        "id": post.id,
        "slug": post.slug,
        "title": post.title,
        "excerpt": post.excerpt,
        "content": post.content,
        "coverImageUrl": post.cover_image_url,
        "coverImage": post.cover_image_url,
        "authorName": post.author_name,
        "author": post.author_name,
        "authorRole": "Auralis Design Team",
        "category": post.category,
        "tags": post.tags,
        "date": (post.published_at or post.created_at).isoformat(),
        "readTime": "5 min read",
        "published": post.published,
    }


@router.get("")
def list_blogs(db: Session = Depends(get_db)):
    posts = (
        db.query(BlogPost)
        .filter(BlogPost.published.is_(True), BlogPost.archived_at.is_(None))
        .order_by(BlogPost.published_at.desc())
        .all()
    )
    return success([blog_to_client(post) for post in posts])


@router.get("/{slug}")
def get_blog(slug: str, db: Session = Depends(get_db)):
    post = (
        db.query(BlogPost)
        .filter(BlogPost.slug == slug, BlogPost.published.is_(True), BlogPost.archived_at.is_(None))
        .one_or_none()
    )
    if not post:
        raise ApiError("NOT_FOUND", "Blog post not found.", status.HTTP_404_NOT_FOUND)
    return success(blog_to_client(post))

