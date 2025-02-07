package com.library.repository;

import com.library.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByBookIdAndApprovedTrue(Long bookId);
    List<Review> findByUserIdAndApprovedTrue(Long userId);
    List<Review> findByApprovedFalse();
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.book.id = :bookId AND r.approved = true")
    Double getAverageRatingForBook(Long bookId);
}
