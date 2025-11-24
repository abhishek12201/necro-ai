<?php
/**
 * Legacy WordPress Theme - Index Template
 * Theme Name: OldSchool Theme
 * Version: 1.0 (2010)
 * Uses deprecated WordPress functions and jQuery
 */

get_header();

// Deprecated function - should use get_posts() or WP_Query
$posts = query_posts('posts_per_page=10&cat=1');

if (have_posts()) : 
    while (have_posts()) : the_post();
?>
    <div class="post" id="post-<?php the_ID(); ?>">
        <h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
        
        <!-- Deprecated function -->
        <div class="meta">
            Posted on <?php the_time('F j, Y'); ?> by <?php the_author(); ?>
            in <?php the_category(', '); ?>
        </div>
        
        <div class="entry">
            <?php the_content('Read more...'); ?>
        </div>
        
        <!-- Inline PHP and HTML mixing -->
        <div class="tags">
            <?php 
            $tags = get_the_tags();
            if ($tags) {
                foreach($tags as $tag) {
                    echo '<a href="' . get_tag_link($tag->term_id) . '">' . $tag->name . '</a> ';
                }
            }
            ?>
        </div>
    </div>

<?php 
    endwhile;
else :
?>
    <p>No posts found.</p>
<?php 
endif;

// Deprecated sidebar function
get_sidebar();
get_footer();

// Inline jQuery - should be enqueued properly
?>
<script type="text/javascript">
jQuery(document).ready(function($) {
    // Old jQuery patterns
    $('.post').hover(
        function() {
            $(this).css('background-color', '#f0f0f0');
        },
        function() {
            $(this).css('background-color', '#ffffff');
        }
    );
    
    // Deprecated jQuery methods
    $('.read-more').live('click', function(e) {
        e.preventDefault();
        $(this).parent().find('.full-content').slideToggle();
    });
    
    // Poor AJAX implementation
    $('#load-more').click(function() {
        $.ajax({
            url: '<?php echo admin_url('admin-ajax.php'); ?>',
            type: 'POST',
            data: {
                action: 'load_more_posts',
                offset: $('.post').length
            },
            success: function(response) {
                $('#posts-container').append(response);
            }
        });
    });
});
</script>

<style>
/* Inline styles - should be in separate CSS file */
.post {
    margin-bottom: 20px;
    padding: 15px;
    border: 1px solid #ddd;
}
.post h2 {
    font-size: 24px;
    margin-bottom: 10px;
}
</style>
